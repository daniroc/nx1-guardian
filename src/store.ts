import { DatabaseSync } from 'node:sqlite';
import { existsSync, lstatSync } from 'node:fs';
import { randomUUID, type KeyObject } from 'node:crypto';
import { canonical, digest, authenticated, signed, parseCanonical, fail, validateAuditEvent, type Policy, type Budget, type Grant, type AuditEvent } from './contracts.js';

export interface Operation { requestDigest: string; intentDigest: string; nonce: string; grant: Grant; status: 'RESERVED' | 'DISPATCHING' | 'COMPLETE' | 'UNKNOWN' | 'CANCELLED' }
export interface Session { started: number; terminal: boolean; used: Budget; operations: Record<string, Operation> }
export interface State { authority: string; policy: Policy | null; epoch: number; locked: boolean; lastNow: number; sessions: Record<string, Session>; adminIds: string[]; evidence: {actors:string[];intent:string;reason:string} }
export interface Checkpoint { sequence: number; hash: string; at: number; signature: string }
export interface Witness { read(): Checkpoint | null; advance(sequence: number, hash: string, at: number): void; verify(cp: Checkpoint): boolean }

// Trusted synthetic witness adapter. Its signing key never enters Guardian or agent requests.
// Same host/filesystem in this lab: separately controlled API, NOT independent production custody.
export class FileWitness implements Witness {
  constructor(private readonly file: string, private readonly privateKey: KeyObject, private readonly publicKey: KeyObject) {}
  private database(): DatabaseSync {
    if (existsSync(this.file) && lstatSync(this.file).isSymbolicLink()) fail('EVIDENCE_UNAVAILABLE');
    const db=new DatabaseSync(this.file);
    db.exec('PRAGMA synchronous=FULL; PRAGMA journal_mode=DELETE; PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS checkpoint(id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL)');
    return db;
  }
  read(): Checkpoint | null {
    if (!existsSync(this.file)) return null;
    const db=this.database();
    try {const row=db.prepare('SELECT value FROM checkpoint WHERE id=1').get() as {value:string}|undefined;return row?parseCanonical(row.value,1024) as Checkpoint:null;}finally{db.close();}
  }
  verify(cp: Checkpoint): boolean {
    if (!cp || Object.keys(cp).sort().join(',') !== 'at,hash,sequence,signature' || !Number.isSafeInteger(cp.sequence) || cp.sequence < 1 || !Number.isSafeInteger(cp.at) || cp.at < 0 || !/^[0-9a-f]{64}$/.test(cp.hash)) return false;
    return authenticated({sequence:cp.sequence,hash:cp.hash,at:cp.at}, cp.signature, this.publicKey);
  }
  advance(sequence: number, hash: string, at: number): void {
    const prior = this.read();
    if (prior && (!this.verify(prior) || sequence !== prior.sequence + 1 || at < prior.at)) fail('EVIDENCE_UNAVAILABLE');
    const data = {sequence,hash,at};
    const db=this.database();
    try {db.exec('BEGIN IMMEDIATE');db.prepare('INSERT INTO checkpoint VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(canonical({...data,signature:signed(data,this.privateKey)}));db.exec('COMMIT');}finally{db.close();}
    // SQLite FULL sync is local durability, not production immutable custody.
  }
}

export class Store {
  readonly db: DatabaseSync;
  constructor(file: string, private readonly witness: Witness) {
    if (existsSync(file) && lstatSync(file).isSymbolicLink()) fail('EVIDENCE_UNAVAILABLE');
    this.db = new DatabaseSync(file);
    this.db.exec(`PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; PRAGMA busy_timeout=0;
      CREATE TABLE IF NOT EXISTS current (id INTEGER PRIMARY KEY CHECK(id=1), state TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (sequence INTEGER PRIMARY KEY, previous TEXT NOT NULL, hash TEXT NOT NULL, kind TEXT NOT NULL, state TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'append only'); END;
      CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'append only'); END;`);
  }
  initialize(policy: Policy | null, now: number): void {
    if (this.db.prepare('SELECT id FROM current').get()) return;
    if (this.witness.read() !== null || this.db.prepare('SELECT sequence FROM events').get()) fail('EVIDENCE_UNAVAILABLE');
    const state: State = {authority:randomUUID(),policy,epoch:0,locked:false,lastNow:now,sessions:{},adminIds:[],evidence:{actors:[],intent:digest(policy),reason:'BOOTSTRAP'}};
    this.db.exec('BEGIN IMMEDIATE');
    try { this.persist(state,'BOOTSTRAP',now); this.db.exec('COMMIT'); } catch (e) { this.db.exec('ROLLBACK'); throw e; }
    const event = this.last(); this.witness.advance(event.sequence,event.hash,now);
  }
  private last(): AuditEvent { return this.db.prepare('SELECT * FROM events ORDER BY sequence DESC LIMIT 1').get() as unknown as AuditEvent; }
  inspect(now: number): State {
    const rows = this.db.prepare('SELECT * FROM events ORDER BY sequence').all() as unknown as AuditEvent[];
    if (!rows.length || rows.length > 1024) fail('EVIDENCE_UNAVAILABLE');
    let previous = '0'.repeat(64);
    for (const [i,r] of rows.entries()) {
      validateAuditEvent({...r});
      if (r.sequence !== i + 1 || r.previous !== previous || digest({sequence:r.sequence,previous:r.previous,kind:r.kind,state:r.state}) !== r.hash) fail('EVIDENCE_UNAVAILABLE');
      parseCanonical(r.state); previous = r.hash;
    }
    const last = rows.at(-1)!;
    const checkpoint = this.witness.read();
    if (!checkpoint || !this.witness.verify(checkpoint) || checkpoint.sequence !== last.sequence || checkpoint.hash !== last.hash || now < checkpoint.at || now - checkpoint.at > 60_000) fail('EVIDENCE_UNAVAILABLE');
    const current = this.db.prepare('SELECT state FROM current WHERE id=1').get() as {state:string} | undefined;
    if (!current || current.state !== last.state) fail('EVIDENCE_UNAVAILABLE');
    return parseCanonical(current.state) as State;
  }
  private persist(state: State, kind: string, now: number): void {
    state.lastNow = now;
    const previous = this.last();
    const sequence = (previous?.sequence ?? 0) + 1;
    if (sequence > 1024) fail('EVIDENCE_UNAVAILABLE');
    const data = {sequence,previous:previous?.hash ?? '0'.repeat(64),kind,state:canonical(state)};
    this.db.prepare('INSERT INTO events VALUES (?,?,?,?,?)').run(sequence,data.previous,digest(data),kind,data.state);
    this.db.prepare('INSERT INTO current VALUES(1,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(data.state);
  }
  change<T>(now: number, kind: string, transition: (state: State) => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    let result: T;
    try { const s = this.inspect(now); result = transition(s);
      if(result && typeof result==='object' && 'decision' in result){const d=result as {decision:string;reason?:string};if(d.decision==='DENY'){kind='DENY_'+String(d.reason);s.evidence.reason=String(d.reason);}else{s.evidence.reason='ALLOW';}}
      this.persist(s,kind,now); this.db.exec('COMMIT'); }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
    const event = this.last();
    // A failed witness advancement freezes further effects, retaining committed reservations.
    this.witness.advance(event.sequence,event.hash,now);
    return result;
  }
  close(): void { this.db.close(); }
}

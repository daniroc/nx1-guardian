import { Store, type State, type Session, type Operation } from './store.js';
import { CAPS, GuardianError, authenticated, canonical, closed, digest, fail, integer, parseCanonical, validateAdmin, validatePolicy, validateRequest, validateGrant, validateDecision,
  type Approval, type Identity, type Policy, type Decision, type Grant, type Request, type AdminCommand, type Reason, type StopStatus } from './contracts.js';

export interface FakeEffect { next(signal: AbortSignal): Promise<{ done: boolean; bytes: Uint8Array }> }
export interface FakeProvider { readonly attempted: number; readonly completed: number; start(grant: Grant, signal: AbortSignal): FakeEffect; cancel(): boolean; revoke(): boolean }
export class Guardian {
  private readonly identities: readonly Identity[];
  private fence = false;
  private lastClock = 0;
  private verified: State | null = null;
  private pendingStopEvidence: State['evidence'] | null = null;
  private readonly aborts = new Map<string,AbortController>();
  constructor(private readonly store: Store, identities: readonly Identity[], private readonly clock: () => number,
    policy: Policy | null, approvals: readonly Approval[]) {
    this.identities = identities.map(i => Object.freeze({...i}));
    if (new Set(identities.map(i=>i.id)).size !== identities.length || new Set(identities.map(i=>i.publicKey.export({type:'spki',format:'der'}).toString('hex'))).size!==identities.length || identities.some(i=>i.publicKey.asymmetricKeyType !== 'ed25519')) fail('IDENTITY_INVALID');
    const now = this.now();
    if (policy) { validatePolicy(policy); this.dual({purpose:'BOOTSTRAP',policy},approvals,now); }
    this.store.initialize(policy ? JSON.parse(canonical(policy)) as Policy : null,now);
    // Never reapply constructor policy on restart; persisted policy/epoch are authoritative.
  }
  private now(): number {
    const now = this.clock();
    if (!Number.isSafeInteger(now) || now < this.lastClock || now < 0) fail('CLOCK_INVALID');
    this.lastClock = now; return now;
  }
  private identity(actor: string, role: Identity['role'], now: number): Identity {
    const i = this.identities.find(i=>i.id===actor);
    if (!i || i.role !== role || i.revoked || i.expires <= now) fail('IDENTITY_INVALID');
    return i;
  }
  private dual(value: unknown, approvals: readonly Approval[], now: number): void {
    if (approvals.length !== 2 || new Set(approvals.map(a=>a.actor)).size !== 2) fail('APPROVAL_INVALID');
    for (const a of approvals) { closed(a,['actor','signature']); const i=this.identity(a.actor,'administrator',now); if (!authenticated(value,a.signature,i.publicKey)) fail('APPROVAL_INVALID'); }
  }
  private healthy(s: State, now: number): void { if (now < s.lastNow) fail('CLOCK_INVALID'); }
  private ttl(issued: number, expires: number, now: number): void { if (issued > now || expires <= now || expires <= issued || expires-issued > 60_000) fail('IDENTITY_INVALID'); }
  private deny(reason: Reason): Decision { const d:Decision={decision:'DENY',reason};validateDecision(d);return d; }
  private error(e: unknown): Reason { return e instanceof GuardianError ? e.code : 'EVIDENCE_UNAVAILABLE'; }
  // Cache only integrity-verified reads and fully witnessed transitions, never a failed commit.
  private commit<T>(now:number,kind:string,transition:(state:State)=>T):T {
    let candidate:State|null=null;
    const result=this.store.change(now,kind,s=>{const value=transition(s);candidate=JSON.parse(canonical({...s,lastNow:now})) as State;return value;});
    this.verified=candidate;return result;
  }
  private flushStopEvidence(now:number):void {
    const evidence=this.pendingStopEvidence;
    if(!evidence)return;
    this.commit(now,'LOCAL_STOP_UNCONFIRMED',s=>{this.healthy(s,now);s.evidence={...evidence,actors:[...evidence.actors]};});
    this.pendingStopEvidence=null;
  }
  private inspect(now:number):State {
    const s=this.store.inspect(now);this.verified=JSON.parse(canonical(s)) as State;
    this.flushStopEvidence(now);return this.verified!;
  }
  private localStop():void {this.fence=true;for(const abort of this.aborts.values())abort.abort();}
  private stopFailure(c:AdminCommand,actors:string[],stage:'READ_CONTEXT'|'PERSIST_STOP',error:unknown,now:number):StopStatus {
    this.localStop();
    // Retain the first unacknowledged incident; persistence is best-effort, never authorization.
    this.pendingStopEvidence??={actors:[...actors],intent:digest(c),reason:'LOCAL_STOP_UNCONFIRMED:'+stage+':'+this.error(error)};
    try{this.flushStopEvidence(now);}catch{/* No honest sink: keep the fence and pending evidence. */}
    return 'STOP_UNCONFIRMED';
  }
  private recordDenial(reason: Reason): Decision {
    try { const now=this.now(); this.flushStopEvidence(now);this.commit(now,'DENY_'+reason,s=>{this.healthy(s,now);s.evidence={actors:[],intent:digest({reason}),reason};}); }
    catch (e) { return this.deny(this.error(e)); }
    return this.deny(reason);
  }
  // Separate synthetic administrative channel; there is no policy-update or budget-increase API.
  private adminContext(s:State,c:AdminCommand,now:number):void {
    this.healthy(s,now);
    const p=s.policy;
    if(!p)fail('POLICY_ABSENT');
    if(typeof s.authority!=='string' || c.authority!==s.authority || c.policyDigest!==digest(p) || c.policyEpoch!==p.epoch ||
      canonical(c.binding)!==canonical({project:p.project,repository:p.repository,branch:p.branch,scope:p.scope}) ||
      c.subject!==(c.action==='open'?c.session:'all-sessions'))fail('BINDING_MISMATCH');
    if(c.epoch!==s.epoch)fail('LEASE_STALE');
    if(s.adminIds.includes(c.id))fail('REPLAY');
    if(s.adminIds.length>=64)fail('EVIDENCE_UNAVAILABLE');
  }
  administer(raw: string, approvals: readonly Approval[]): StopStatus | 'OPENED' | 'RECOVERED' {
    const command = parseCanonical(raw); validateAdmin(command);
    const now=this.now(); this.ttl(command.issued,command.expires,now);
    this.dual(command,approvals,now);
    let context:State;
    try{context=this.inspect(now);}catch(e){
      if(command.action!=='stop')throw e;
      const cached=this.verified;
      if(!cached || now-cached.lastNow>CAPS.sessionMs)fail('EVIDENCE_UNAVAILABLE');
      this.adminContext(cached,command,now);
      return this.stopFailure(command,approvals.map(a=>a.actor),'READ_CONTEXT',e,now);
    }
    this.adminContext(context,command,now);
    if (command.action === 'stop') return this.stop(command,now,approvals.map(a=>a.actor));
    this.commit(now,'ADMIN_'+command.action,s=>{
      this.adminContext(s,command,now);
      s.evidence={actors:approvals.map(a=>a.actor),intent:digest(command),reason:'ADMIN_'+command.action};
      if (s.adminIds.includes(command.id)) fail('REPLAY');
      if (command.epoch !== s.epoch) fail('LEASE_STALE');
      s.adminIds.push(command.id);
      if (s.adminIds.length > 64) fail('EVIDENCE_UNAVAILABLE');
      if (command.action === 'recover') {
        if (!s.locked) fail('ADMIN_FORBIDDEN');
        for (const session of Object.values(s.sessions)) session.terminal=true;
        s.epoch++; integer(s.epoch); s.locked=false;
      } else {
        if (s.locked || this.fence) fail('EMERGENCY_ACTIVE');
        if (!s.policy || s.policy.expires<=now) fail('POLICY_ABSENT');
        if (Object.hasOwn(s.sessions,command.session) || Object.keys(s.sessions).length >= 16 || !/^[A-Za-z0-9_-]+$/.test(command.session)) fail('SESSION_INVALID');
        s.sessions[command.session]={started:now,terminal:false,used:{admissions:0,iterations:0,tokens:0,cost:0},operations:{}};
      }
    });
    if (command.action === 'recover') {this.fence=false;return 'RECOVERED';}
    return 'OPENED';
  }
  private stop(command: AdminCommand, now: number, actors:string[]): StopStatus {
    this.localStop();
    try {
      this.commit(now,'STOP_DURABLE',s=>{
        this.adminContext(s,command,now);
        s.evidence={actors,intent:digest(command),reason:'STOP_DURABLE'};
        if (s.adminIds.includes(command.id) || command.epoch!==s.epoch) fail('REPLAY');
        s.adminIds.push(command.id); s.epoch++; integer(s.epoch); s.locked=true;
        for (const session of Object.values(s.sessions)) {session.terminal=true;for(const op of Object.values(session.operations))if(op.status==='RESERVED')op.status='CANCELLED';}
      });
      return 'STOP_DURABLE';
    } catch(e) { return this.stopFailure(command,actors,'PERSIST_STOP',e,now); }
  }
  confirmStop(provider: FakeProvider): StopStatus {
    try {const now=this.now();const s=this.inspect(now); if (!s.locked) return 'STOP_UNCONFIRMED';
      const cancellation=provider.cancel(),revocation=provider.revoke();
      if (cancellation!==true || revocation!==true || this.aborts.size) return 'STOP_DURABLE';
      return this.commit(now,'STOP_CONFIRM',state=>{
        this.healthy(state,now);
        if(!state.locked)return 'STOP_UNCONFIRMED';
        if(this.aborts.size || Object.values(state.sessions).some(session=>Object.values(session.operations).some(op=>op.status==='DISPATCHING' || op.status==='UNKNOWN')))return 'STOP_DURABLE';
        return 'STOP_ENFORCED';
      });
    } catch {return 'STOP_UNCONFIRMED';}
  }
  admit(raw: string): Decision {
    try {
      const packet=parseCanonical(raw);closed(packet,['request','signature']);validateRequest(packet.request);
      const r=packet.request; if (typeof packet.signature !== 'string') fail('SCHEMA_INVALID');
      const now=this.now(),i=this.identity(r.actor,'agent',now);
      if (!authenticated(r,packet.signature,i.publicKey)) fail('IDENTITY_INVALID');
      this.ttl(r.issued,r.expires,now);
      this.flushStopEvidence(now);
      return this.commit(now,'ADMISSION',s=>{
        this.healthy(s,now);
        s.evidence={actors:[r.actor],intent:digest(r),reason:'ADMISSION'};
        if (s.locked || this.fence) return this.deny('EMERGENCY_ACTIVE');
        const p=s.policy;
        if (!p) return this.deny('POLICY_ABSENT');
        if (p.expires<=now || p.epoch!==r.policyEpoch || digest(p)!==r.policyDigest || r.emergencyEpoch!==s.epoch) return this.deny('POLICY_STALE');
        const session=s.sessions[r.session];
        if (!session || session.terminal) return this.deny('SESSION_INVALID');
        if (now-session.started>=CAPS.sessionMs) {session.terminal=true;return this.deny('BUDGET_EXHAUSTED');}
        if (session.used.admissions>=CAPS.admissions) {session.terminal=true;return this.deny('BUDGET_EXHAUSTED');}
        session.used.admissions++;
        if (!p.agents.includes(r.actor)) return this.deny('IDENTITY_INVALID');
        if (r.operation!==p.operation) return this.deny('OPERATION_DENIED');
        if (['project','repository','branch','scope'].some(k=>r[k as keyof Request]!==p[k as keyof Policy])) return this.deny('BINDING_MISMATCH');
        if (r.parent!==null && !Object.hasOwn(session.operations,r.parent)) return this.deny('SESSION_INVALID');
        const intentDigest=digest({actor:r.actor,session:r.session,parent:r.parent,operation:r.operation,project:r.project,repository:r.repository,branch:r.branch,scope:r.scope,text:r.text});
        if (Object.values(s.sessions).some(x=>Object.hasOwn(x.operations,r.id) || Object.values(x.operations).some(o=>o.intentDigest===intentDigest || o.grant.actor===r.actor && o.nonce===r.nonce))) return this.deny('REPLAY');
        if (Object.values(s.sessions).some(x=>Object.values(x.operations).some(o=>['RESERVED','DISPATCHING','UNKNOWN'].includes(o.status)))) return this.deny('CONCURRENCY_LIMIT');
        if (r.budget.tokens<512 || r.budget.cost<25) return this.deny('BUDGET_EXHAUSTED');
        if (session.used.iterations+r.budget.iterations>CAPS.iterations || session.used.tokens+r.budget.tokens>CAPS.tokens || session.used.cost+r.budget.cost>CAPS.cost) {session.terminal=true;return this.deny('BUDGET_EXHAUSTED');}
        for (const k of ['iterations','tokens','cost'] as const) session.used[k]+=r.budget[k];
        const grant: Grant={id:digest({purpose:'GRANT',request:digest(r),intentDigest}),execution:r.id,actor:r.actor,session:r.session,policyDigest:r.policyDigest,policyEpoch:r.policyEpoch,emergencyEpoch:s.epoch,
          expires:Math.min(r.expires,p.expires,session.started+CAPS.sessionMs,now+CAPS.jobMs),budget:{...r.budget},
          binding:{project:r.project,repository:r.repository,branch:r.branch,scope:r.scope},operation:'fixture.read'};
        session.operations[r.id]={requestDigest:digest(r),intentDigest,nonce:r.nonce,grant,status:'RESERVED'};
        validateDecision({decision:'ALLOW',grant});
        return {decision:'ALLOW',grant};
      });
    } catch(e) {return this.recordDenial(this.error(e));}
  }
  private operation(s: State,g: Grant,now: number): {session:Session;op:Operation} {
    this.healthy(s,now);
    if (s.locked || this.fence) fail('EMERGENCY_ACTIVE');
    const session=s.sessions[g.session],op=session?.operations[g.execution];
    if (!session || !op || session.terminal || canonical(op.grant)!==canonical(g)) fail('LEASE_STALE');
    if (g.expires<=now || s.epoch!==g.emergencyEpoch || !s.policy || s.policy.epoch!==g.policyEpoch || digest(s.policy)!==g.policyDigest) fail('LEASE_STALE');
    this.identity(g.actor,'agent',now);
    return {session,op};
  }
  async dispatch(grant: Grant, proof: Approval, provider: FakeProvider): Promise<{status:'COMPLETE';bytes:number}|{status:'UNKNOWN';reason:Reason}> {
    let started=false,claimed=false;
    const abort=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
    try {
      const now=this.now();
      validateGrant(grant);
      closed(proof,['actor','signature']);
      if(proof.actor!==grant.actor || !authenticated({purpose:'USE_GRANT',grant},proof.signature,this.identity(proof.actor,'agent',now).publicKey))fail('IDENTITY_INVALID');
      this.flushStopEvidence(now);
      this.commit(now,'DISPATCH_INTENT',s=>{const {op}=this.operation(s,grant,now);if(op.status!=='RESERVED')fail('REPLAY');op.status='DISPATCHING';});
      claimed=true;
      this.aborts.set(grant.id,abort);
      const remaining=grant.expires-this.now(); if(remaining<=0)fail('LEASE_STALE');
      const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(new GuardianError('DEADLINE'));},Math.min(remaining,CAPS.jobMs));});
      // Effect starts only after witnessed dispatch intent and a final synchronous fence check.
      this.operation(this.inspect(this.now()),grant,this.now());
      started=true;const stream=provider.start(JSON.parse(canonical(grant)) as Grant,abort.signal);
      let bytes=0;
      for(let chunks=0;chunks<17;chunks++) {
        const part=await Promise.race([stream.next(abort.signal),deadline]);
        closed(part,['done','bytes']);if(typeof part.done!=='boolean')fail('OUTPUT_LIMIT');
        if(abort.signal.aborted)fail('EFFECT_UNKNOWN');
        this.operation(this.inspect(this.now()),grant,this.now());
        if(!(part.bytes instanceof Uint8Array))fail('OUTPUT_LIMIT');
        bytes+=part.bytes.length;integer(bytes);if(bytes>4096)fail('OUTPUT_LIMIT');
        if(part.done){
          this.commit(this.now(),'COMPLETE',s=>{this.operation(s,grant,this.now()).op.status='COMPLETE';});
          return {status:'COMPLETE',bytes};
        }
      }
      return fail('OUTPUT_LIMIT');
    } catch(e) {
      if(started)abort.abort();
      if(claimed)try {this.flushStopEvidence(this.now());this.commit(this.now(),'EFFECT_UNKNOWN',s=>{const session=s.sessions[grant.session],op=session?.operations[grant.execution];if(op && canonical(op.grant)===canonical(grant) && op.status==='DISPATCHING'){op.status='UNKNOWN';if(session)session.terminal=true;}});}catch{/* Missing evidence keeps the persisted dispatch intent and reservation. */}
      return {status:'UNKNOWN',reason:this.error(e)};
    } finally {if(timer)clearTimeout(timer);if(this.aborts.get(grant.id)===abort)this.aborts.delete(grant.id);}
  }
  // Cancel only undispatched reservations. Accounting is conservative and never refunded.
  expireReservations(): void {
    const now=this.now();this.flushStopEvidence(now);this.commit(now,'EXPIRE',s=>{this.healthy(s,now);for(const session of Object.values(s.sessions))for(const op of Object.values(session.operations))if(op.status==='RESERVED' && op.grant.expires<=now)op.status='CANCELLED';});
  }
}

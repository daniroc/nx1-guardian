import { createHash, sign, verify, type KeyObject } from 'node:crypto';

export type Role = 'agent' | 'administrator';
export interface Identity { readonly id: string; readonly role: Role; readonly publicKey: KeyObject; readonly expires: number; readonly revoked: boolean }
export interface Binding { project: string; repository: string; branch: string; scope: string }
export interface Policy extends Binding { nx1Version: '1.3'; epoch: number; expires: number; agents: string[]; operation: 'fixture.read' }
export interface Budget { iterations: number; admissions: number; tokens: number; cost: number }
export const CAPS = Object.freeze({ iterations: 4, admissions: 16, concurrency: 1, jobMs: 10_000, sessionMs: 60_000, tokens: 2048, cost: 100 });
export interface Request extends Binding {
  nx1Version: '1.3'; kind: 'proposal'; audience: 'guardian-lab'; actor: string; id: string; session: string;
  parent: string | null; nonce: string; issued: number; expires: number; policyDigest: string; policyEpoch: number;
  emergencyEpoch: number; operation: 'fixture.read' | 'secrets.read' | 'deploy' | 'policy.update' | 'budget.increase' | 'emergency.unlock';
  budget: Budget; text: string;
}
export interface Approval { actor: string; signature: string }
export interface Packet { request: Request; signature: string }
export interface AdminCommand { nx1Version: '1.3'; kind: 'administration'; audience: 'guardian-lab-admin'; action: 'open' | 'stop' | 'recover'; id: string; session: string; subject: string; authority: string; binding: Binding; policyDigest: string; policyEpoch: number; epoch: number; issued: number; expires: number }
export type Reason = 'SCHEMA_INVALID' | 'CANONICAL_INVALID' | 'IDENTITY_INVALID' | 'POLICY_ABSENT' | 'POLICY_STALE' | 'OPERATION_DENIED' | 'BINDING_MISMATCH' | 'EMERGENCY_ACTIVE' | 'BUDGET_EXHAUSTED' | 'CONCURRENCY_LIMIT' | 'REPLAY' | 'SESSION_INVALID' | 'EVIDENCE_UNAVAILABLE' | 'CLOCK_INVALID' | 'LEASE_STALE' | 'ADMIN_FORBIDDEN' | 'APPROVAL_INVALID' | 'OUTPUT_LIMIT' | 'DEADLINE' | 'EFFECT_UNKNOWN';
export class GuardianError extends Error { constructor(readonly code: Reason) { super(code); this.name = 'GuardianError'; } }
export interface Grant { id: string; execution: string; actor: string; session: string; policyDigest: string; policyEpoch: number; emergencyEpoch: number; expires: number; budget: Budget; binding: Binding; operation: 'fixture.read' }
export type Decision = { decision: 'DENY'; reason: Reason } | { decision: 'ALLOW'; grant: Grant };
export type StopStatus = 'STOP_DURABLE' | 'STOP_ENFORCED' | 'STOP_UNCONFIRMED';
export interface Emergency { nx1Version: '1.3'; epoch: number; locked: boolean; status: StopStatus }
export interface AuditEvent { sequence: number; previous: string; hash: string; kind: string; state: string }

export function fail(code: Reason): never { throw new GuardianError(code); }
export function integer(value: unknown): asserts value is number { if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) fail('SCHEMA_INVALID'); }
export function closed(value: unknown, keys: readonly string[]): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) fail('SCHEMA_INVALID');
}
export function ascii(value: unknown, max = 128): asserts value is string { if (typeof value !== 'string' || !value.length || value.length > max || !/^[\x20-\x7e\n\r\t]+$/.test(value)) fail('SCHEMA_INVALID'); }
// Deliberately restricted ASCII/integer canonical profile, NOT a full RFC8785/JCS implementation.
export function canonical(value: unknown, depth = 0): string {
  if (depth > 8) fail('SCHEMA_INVALID');
  if (value === null) return 'null';
  if (typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') { integer(value); return String(value); }
  if (typeof value === 'string') { ascii(value, 65536); return JSON.stringify(value); }
  if (Array.isArray(value)) { if (value.length > 1024) fail('SCHEMA_INVALID'); return '[' + value.map(x => canonical(x, depth + 1)).join(',') + ']'; }
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) fail('SCHEMA_INVALID');
  const obj = value as Record<string, unknown>, keys = Object.keys(obj).sort();
  if (keys.length > 1024) fail('SCHEMA_INVALID');
  return '{' + keys.map(k => { ascii(k); return JSON.stringify(k) + ':' + canonical(obj[k], depth + 1); }).join(',') + '}';
}
export function digest(value: unknown): string { return createHash('sha256').update('NX1-GUARDIAN-LAB/1\n' + canonical(value)).digest('hex'); }
export function signed(value: unknown, key: KeyObject): string { return sign(null, Buffer.from('NX1-GUARDIAN-LAB/1\n' + canonical(value)), key).toString('base64url'); }
export function authenticated(value: unknown, signature: string, key: KeyObject): boolean {
  if (typeof signature !== 'string' || !/^[A-Za-z0-9_-]{86}$/.test(signature)) return false;
  const decoded=Buffer.from(signature,'base64url');
  if(decoded.length!==64 || decoded.toString('base64url')!==signature || key.asymmetricKeyType!=='ed25519')return false;
  try { return verify(null, Buffer.from('NX1-GUARDIAN-LAB/1\n' + canonical(value)), key, decoded); } catch { return false; }
}
export function parseCanonical(raw: string, max = 65536): unknown {
  if (Buffer.byteLength(raw) > max || !/^[\x20-\x7e\n\r\t]*$/.test(raw)) fail('SCHEMA_INVALID');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { fail('SCHEMA_INVALID'); }
  if (canonical(parsed) !== raw) fail('CANONICAL_INVALID');
  return parsed;
}
export function validateBudget(b: unknown): asserts b is Budget { closed(b, ['iterations','admissions','tokens','cost']); for (const v of Object.values(b)) integer(v); if (b.admissions !== 1 || b.iterations !== 1) fail('SCHEMA_INVALID'); }
export function validateRequest(r: unknown): asserts r is Request {
  closed(r, ['nx1Version','kind','audience','actor','id','session','parent','nonce','issued','expires','policyDigest','policyEpoch','emergencyEpoch','project','repository','branch','scope','operation','budget','text']);
  if (r.nx1Version !== '1.3' || r.kind !== 'proposal' || r.audience !== 'guardian-lab') fail('SCHEMA_INVALID');
  for (const k of ['actor','id','session','project','repository','branch','scope']) { ascii(r[k]); if (!/^[A-Za-z0-9._:/-]+$/.test(String(r[k])) || String(r[k]).includes('..')) fail('SCHEMA_INVALID'); }
  if (r.parent !== null) ascii(r.parent);
  ascii(r.text, 32768); ascii(r.policyDigest); ascii(r.nonce);
  if (!/^[0-9a-f]{64}$/.test(r.policyDigest) || !/^[0-9a-f]{32}$/.test(r.nonce)) fail('SCHEMA_INVALID');
  for (const k of ['issued','expires','policyEpoch','emergencyEpoch']) integer(r[k]);
  if (!['fixture.read','secrets.read','deploy','policy.update','budget.increase','emergency.unlock'].includes(String(r.operation))) fail('SCHEMA_INVALID');
  validateBudget(r.budget);
}
export function validatePolicy(p: unknown): asserts p is Policy {
  closed(p, ['nx1Version','epoch','expires','agents','operation','project','repository','branch','scope']);
  if (p.nx1Version !== '1.3' || p.operation !== 'fixture.read') fail('SCHEMA_INVALID');
  integer(p.epoch); integer(p.expires);
  for (const k of ['project','repository','branch','scope']) ascii(p[k]);
  if (!Array.isArray(p.agents) || p.agents.length < 1 || p.agents.length > 2 || new Set(p.agents).size !== p.agents.length) fail('SCHEMA_INVALID');
  for (const agent of p.agents) ascii(agent);
}
export function validateAdmin(c: unknown): asserts c is AdminCommand {
  closed(c, ['nx1Version','kind','audience','action','id','session','subject','authority','binding','policyDigest','policyEpoch','epoch','issued','expires']);
  if (c.nx1Version !== '1.3' || c.kind !== 'administration' || c.audience !== 'guardian-lab-admin' || !['open','stop','recover'].includes(String(c.action))) fail('SCHEMA_INVALID');
  ascii(c.id); ascii(c.session); integer(c.epoch); integer(c.issued); integer(c.expires);
  ascii(c.subject);ascii(c.authority);integer(c.policyEpoch);
  if(typeof c.policyDigest!=='string' || !/^[0-9a-f]{64}$/.test(c.policyDigest))fail('SCHEMA_INVALID');
  closed(c.binding,['project','repository','branch','scope']);for(const v of Object.values(c.binding))ascii(v);
}
export function validateGrant(g: unknown): asserts g is Grant {
  closed(g,['id','execution','actor','session','policyDigest','policyEpoch','emergencyEpoch','expires','budget','binding','operation']);
  for(const k of ['id','execution','actor','session','policyDigest'])ascii(g[k]);
  if(!/^[0-9a-f]{64}$/.test(String(g.policyDigest)) || g.operation!=='fixture.read')fail('SCHEMA_INVALID');
  for(const k of ['policyEpoch','emergencyEpoch','expires'])integer(g[k]);
  validateBudget(g.budget);closed(g.binding,['project','repository','branch','scope']);for(const v of Object.values(g.binding))ascii(v);
}
export function validateDecision(d: unknown): asserts d is Decision {
  if(!d || typeof d!=='object' || !('decision' in d))fail('SCHEMA_INVALID');
  const obj=d as Record<string,unknown>;
  if(obj.decision==='ALLOW'){closed(obj,['decision','grant']);validateGrant(obj.grant);}
  else {closed(obj,['decision','reason']);if(obj.decision!=='DENY' || !['SCHEMA_INVALID','CANONICAL_INVALID','IDENTITY_INVALID','POLICY_ABSENT','POLICY_STALE','OPERATION_DENIED','BINDING_MISMATCH','EMERGENCY_ACTIVE','BUDGET_EXHAUSTED','CONCURRENCY_LIMIT','REPLAY','SESSION_INVALID','EVIDENCE_UNAVAILABLE','CLOCK_INVALID','LEASE_STALE','ADMIN_FORBIDDEN','APPROVAL_INVALID','OUTPUT_LIMIT','DEADLINE','EFFECT_UNKNOWN'].includes(String(obj.reason)))fail('SCHEMA_INVALID');}
}
export function validateEmergency(e: unknown): asserts e is Emergency {
  closed(e,['nx1Version','epoch','locked','status']);integer(e.epoch);if(e.nx1Version!=='1.3' || typeof e.locked!=='boolean' || !['STOP_DURABLE','STOP_ENFORCED','STOP_UNCONFIRMED'].includes(String(e.status)))fail('SCHEMA_INVALID');
}
export function validateAuditEvent(e: unknown): asserts e is AuditEvent {
  closed(e,['sequence','previous','hash','kind','state']);integer(e.sequence);ascii(e.kind);ascii(e.state,65536);
  if(e.sequence<1 || typeof e.previous!=='string' || typeof e.hash!=='string' || !/^[0-9a-f]{64}$/.test(e.previous) || !/^[0-9a-f]{64}$/.test(e.hash))fail('SCHEMA_INVALID');
}

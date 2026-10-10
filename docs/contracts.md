# Strict NX1 1.3 laboratory profile

`src/contracts.ts` owns types and runtime validators for request, policy, budget, grant, decision, administrator command, emergency record and audit event. SQLite checkpoints have a closed schema and signature verification. Unknown fields, unsupported kinds/versions, malformed signatures, noncanonical JSON, duplicate keys, unsafe integers, negative zero, non-ASCII strings and excessive sizes/depth are denied. No permissive protocol fallback is present.

This uses a **restricted ASCII/safe-nonnegative-integer canonical profile**, not a full RFC8785 JCS implementation or a replacement for NX1 Core. JSON keys sort deterministically and the received serialization must match canonical bytes exactly; duplicate keys/whitespace/alternative numeric representations cannot survive this comparison. Signature/digest domain is `NX1-GUARDIAN-LAB/1\n`; purpose/audience and closed object shape distinguish bootstrap, administration, proposals and grant use. Policy carries explicit version 1.3. Agent text can contain NX1-looking instructions but remains untrusted text. This narrows the standalone admission profile without modifying Nexus's compatibility contracts.

Proposal binds verified agent identity, `kind=proposal`, audience, execution ID, session and parent operation, nonce, project, exact repository, branch, scope, operation, TTL, policy digest/epoch, emergency epoch and requested synthetic upper-bound budget. The only allowlisted operation is `fixture.read`. Recognized forbidden operations are secrets.read, deploy, policy.update, budget.increase and emergency.unlock; they remain validly expressible denial fixtures. Schema validity never grants access.

Grant use requires a separately signed `{purpose: USE_GRANT, grant}` by its bound agent; caller, exact persisted grant, epoch, expiry, identity and policy are revalidated. Globally reused execution IDs, repeated agent nonces and duplicate stable intents are denied. All old grants fail after lock/recovery. Parent-child operations share the root ledger; parents must already exist, and children do not create a new budget.

| Synthetic limit | Enforcement |
|---|---|
| Iterations | 4 successful reservations per externally opened session |
| Admissions | 16 signed attempts, including retries/forbidden/concurrency attempts; invalid signatures cannot charge another principal |
| Concurrency | 1 globally across root sessions; reserved/dispatching/unknown occupy it |
| Job duration | At most 10,000 ms lease; complete-response timer races every wait |
| Session duration | 60,000 ms; expiry terminalizes the session |
| Artificial tokens | 2,048; fixed provider worst-case reservation >=512 per effect |
| Artificial cost | 100; fixed provider reservation >=25 per effect |
| Fake response/output | 4,096 total bytes; 17 bounded chunk iterations; stalled next() raced against whole-response deadline |

Time comes from a trusted harness clock, is safe-integer validated, cannot go backward relative to process or persisted state, and fails on stale witness (>60,000 ms). This is neither a production trusted-time service nor a host preemption guarantee. Real provider usage, billing and five-hour ChatGPT/Codex quotas are **not measured or capped**.

Synthetic administration requires two distinct identities **and distinct Ed25519 keys**, valid credentials, a closed admin audience, exact signed command, TTL, current epoch and unused command ID. FIX-01 additionally requires the persisted ledger authority UUID, exact policy digest/epoch, project/repository/branch/scope binding and subject (`session` for open; `all-sessions` for stop/recover). The signed action and emergency epoch bind recovery to that lock generation. Context is checked before local fencing and again inside the transaction. Independent ledgers receive different authority IDs even with identical policy and roots. Restart preserves this identity; copied ledgers are not independently identified physical services. Legacy commands missing these fields fail the closed schema; no fallback exists.

Available actions: open a root session, stop, externally recover. There is no policy-update, budget-increase, key-enrollment or agent unlock API. MFA, UI/CSRF, live key rotation and production policy approval remain outside this laboratory. Bootstrap remains a trusted composition ceremony signing the initial policy, not a remote administrative endpoint.

FIX-02 permits only local STOP containment against a bounded-age last verified context when a fresh read fails. Signature/role/TTL/schema checks still precede this fallback; the same context validator checks authority, policy/resource/subject, epoch and replay. Cached state is never used to grant an operation or unlock. A failed, not durably consumed exact STOP may be retried against fresh state to establish a witnessed lock; successful durable consumption still prohibits replay. No cache is updated from an unacknowledged transaction. Provider cancellation and revocation acknowledgments must equal primitive true under the synchronous adapter contract; ambiguous returns are not awaited or treated as confirmations.

Ed25519 signatures must decode to exactly 64 bytes and round-trip to the identical 86-character unpadded base64url encoding before cryptographic verification. Nonzero unused tail bits, padding, invalid alphabet, wrong lengths, wrong keys and modified signed values are rejected.

Denial reason codes are stable exported types. Missing policy, identity failure, stale policy/lease, emergency, budget/concurrency exhaustion, replay, inconsistent ledger/audit/checkpoint and invalid clock never dispatch the fake provider. Missing audit persistence can prevent recording the denial itself; it cannot turn that denial into ALLOW.

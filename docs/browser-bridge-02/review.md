# BROWSER-BRIDGE-02 audit and readiness review

2026-10-13, Europe/Madrid. Result: CONDITIONAL_PASS for the bounded FIX02 local corrections; LIVE_ACTIVATION_BLOCKED. This is same-assistant, same-environment review, not external independent attestation. No other agent was invoked. No infrastructure, browser session, policy, source, dependency or existing test was changed. This additive review preserves earlier conclusions rather than rewriting historical evidence.

## Baseline and reproducibility

Verified main HEAD `cee3c77d2af5bd6fa5c7fa3ef33fab1c39a33b12`, tree `ac2186e374c7f97f0e33cfad2b13a80571d1c8e9`, clean working tree, 112 tracked artifacts. Read-only remote main matched HEAD at `https://github.com/daniroc/nx1-guardian.git`. Initial restricted network/cache/CIM calls failed; authorized sandbox escalation allowed remote verification, existing pnpm checks and selected host queries. This did not grant Windows administrator elevation. The optional-feature query still required elevation; no feature was installed or enabled.

`evidence.json` records every baseline file SHA256, source/dist parity, new artifact hashes, host measurements and validation counts. FIX02 evidence SHA256 remains `d19df96c992af9b4ee9672eba22eb9dc895fe8f362364072b977f94e7ab9c3d2`. All baseline files, including archived independent-review evidence, remain byte-identical. Original T01-T21, C01-C10 and A01-A27 yield 58 traceability rows; no production classification is promoted by this review.

Run existing `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm test` from the checkout. All four returned 0; 69 tests passed, none failed/cancelled/skipped: 55 Core and 14 inspector tests. Lint is the repository's capability/type scan plus compiler settings, not a comprehensive security analyzer. SQLite remains experimental. For the additional harness, copy `validation/probes.mjs` to the checkout's parent as `BROWSER-BRIDGE-02-probes.mjs`, then run `node BROWSER-BRIDGE-02-probes.mjs`. It imports the built sibling `nx1-guardian/dist`, generates synthetic keys in memory and writes synthetic DB fixtures/results to parent `BROWSER-BRIDGE-02-run`; no network or real provider access. Do not copy fixture DBs into releases. The harness derives fixtures and several probes from REAUDIT-01; new P10-P15 assertions separately challenge FIX02/inspector. These are supplementary probes, not additional repository unit tests or reviewer independence.

## Findings and test oracles

| Finding | Verdict | Reproduced evidence and scope |
|---|---|---|
| F01 rejected dispatch corrupts owner | PASS local | P01: 64 competing invalid/duplicate dispatches preserve canonical full state and active signal; valid STOP still aborts owner. P02 exercises held SQLite writer; P09 failed witness records no fake provider start. |
| F02 premature STOP_ENFORCED | PASS local | P03 shared connection/worker: DISPATCHING and UNKNOWN prevent confirmation; stale grant produces zero effects, pending operation survives reopen. Another worker's local signal is not automatically aborted. No real termination claim. |
| F03 approval context replay | PASS local | P05/P06 bind authority, policy digest/epoch, resource tuple, subject, action, lock epoch; reject substitution, duplicate administrators, agents, noncanonical/duplicate fields and consumed IDs. Valid recovery only for its signed context. |
| F04 signature aliases | PASS local | P07: 370 vectors; 240 tail aliases and 96 malformed strings denied before instrumented crypto.verify; 16 valid synthetic vectors, 16 changed-value denials and two RFC8032/domain checks. Not a cryptographic implementation certification. |
| R01 early read failure | PASS local correction | P10 valid cached-context STOP returns STOP_UNCONFIRMED, aborts owner, records incident after recovery and keeps current process fenced. P14 five unauthorized/context-altered commands leave owner unaffected. P15 expired verified cache cannot authorize fallback. Original unit cases also cover partial witness advance failure and fresh recovery context. |
| R02 truthy acknowledgment | PASS local correction | P04 promise(false) returns STOP_DURABLE. P12: 22 non-true cancel/revoke vectors, one primitive-true positive, one exception. Original tests cover delayed acknowledgment. Exact true is necessary, never independent proof of external quiescence. |
| B02-R01 fallback restart persistence | P2; known limit reproduced, broader requirement BLOCKED | P11: reserve grant; valid STOP during read outage; restore reads and flush LOCAL_STOP_UNCONFIRMED; restart; dispatch old reservation completes once. Incident persisted, state.locked remained false; in-memory fence disappeared. No P0/P1 reproduced in the bounded local claims. This prevents durable-stop approval. |
| B02-R02 incident/fence wording | P3; clarified by this addendum | Historical risks say fence and pending incident are in memory until persistence succeeds. Successful incident persistence does **not** persist the fence. Keep this correction alongside, without altering the original evidence. |

15 probe groups: 14 PASS, one KNOWN_LIMITATION_REPRODUCED, zero harness errors. The latter is deliberately an assertion of the unsafe restart characteristic, not a passed security control. Provider completion counters model effects; AbortSignal or acknowledged fake cancellation does not prove effects have stopped elsewhere. UNKNOWN is conservatively held and has no implemented reconciliation. Unit/probe runs cover same-process connections, not independent OS worker races or power loss.

P08 removes the last audit event after dropping its trigger: missing chain entry fails closed across reopen; P09 witness-advance failure prevents effect start and reopen is denied. Audit DB triggers provide local append-only behavior; hashes/checkpoint signatures provide tamper evidence under intact keys. They do not prevent privileged rollback of both stores, witness compromise, or colluding host roots. Denials depend on available honest storage; outages cannot promise durable incident evidence.

## Bridge-01 eight milestones

| Milestone | Audit classification |
|---|---|
| Baseline/dependency/threat analysis | PASS bounded documents and pinned graph; provenance not verified |
| Offline bidirectional inspector | PASS 14 unit tests plus P13 16 independent vectors; all results dispatchAuthorized=false |
| Architecture/inert UI/operations | PASS artifacts only; UI has disabled initiation, no script/network capability |
| Mandatory authenticated Core messaging/limits | BLOCKED: Core grants fixture.read only, no bridge operation or reviewed Unicode transport extension |
| Isolated real extension and ChatGPT lifecycle | NOT_VERIFIED: absent; no profile or cookies inspected |
| Two VM/OS/network/admin/audit/STOP enforcement | BLOCKED: no installed enforcement evidence; P11 reinforces STOP prerequisite |
| External independent audit closure | NOT_VERIFIED: current review is non-external; original independent findings preserved |
| Autonomous read-only demonstration | NOT_VERIFIED: zero conversations or real sends |

ALLOW means a data classification, never permission. Ordinary malicious approval text may ALLOW yet cannot dispatch. SANITIZE proposes NFC with human approval; no NFKC/confusable folding or silent deletion. Invisible/layout text requires review; hard controls, bidi overrides and malformed surrogates block. Original hash binds exact UTF16LE code units; candidate hash binds UTF8 NFC. Oversize text is rejected before hashing. These are string hashes, not observed wire-byte hashes. Direction is an untrusted label, not authenticated provenance. No original transcript, authenticated bridge provenance or transport audit is persisted by the inspector; those are future blockers, not missing assertions that can be fixed with formatting.

No functional correction was made: promoting the recorded fallback incident to a durable kill boundary needs a separately reviewed persistence/recovery design. This iteration adds a reproducible characterization and precise documentation instead of changing the security contract during audit.

## Gate decisions

| Gate | Status | Evidence / minimum resolution |
|---|---|---|
| FIX02_REAUDIT | PASS scoped local, non-external | R01/R02 regressions and supplementary probes; external independent sign-off remains separate |
| BROWSER_ROUTE_COMPATIBILITY | NOT_VERIFIED | No established supported composer/response transport; applicable agreement/permission unverified |
| VM_HOST_READINESS | BLOCKED | Low free RAM; hypervisor detected but Hyper-V feature/service/guest topology not established |
| CODEX_CAPABILITY_ENFORCEMENT | BLOCKED | Existing tools are not confined by Guardian; requires OS and external network/process enforcement |
| GUARDIAN_CORE_AUTHORITY | BLOCKED | Only synthetic fixture authority; no authenticated messaging transport/bridge contract |
| INDEPENDENT_STOP | BLOCKED | P11 plus absent independent durable kill registry and external-effect observer |
| AUDIT_INTEGRITY | BLOCKED production scope | Local corruption probes PASS; independent immutable storage, custody and recovery not demonstrated |
| REAL_END_TO_END_ACCEPTANCE | NOT_VERIFIED | Zero browser/VM integration or live acceptance tests |

G02A-0 external closure, G02A-1, Nexus integration, autonomous communication and production are not authorized by these PASS labels. Minimum next implementation is an explicitly authorized offline durable-fallback-lock design/regression iteration, then a separate review. The browser/service and confinement prerequisites in readiness.md must also close before any live bridge.

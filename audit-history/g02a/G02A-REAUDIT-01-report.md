# Guardian G02A-0 REAUDIT-01

Result: **CONDITIONAL_PASS for the bounded local core; unconditional gate closure withheld pending R01/R02 correction or explicit disposition.** No P0/P1 was reproduced. F01-F04 corrections hold under the stated canonical JSON and conforming synchronous fake-adapter boundaries. Two P2 findings remain. This is not production security approval or authorization to execute G02A-1.

Date: 2026-10-10. Review scope: all 22 repository artifacts, current source/compiled parity, 48 tests, 58 T/C/A traceability rows, original review and FIX-01 evidence. Source, tests, configuration, dependencies, Nexus and remote state were not changed. All new scripts, logs and synthetic fixture databases are outside the protected checkout.

## Baseline and independence

Repository: independent local nx1-guardian checkout, origin https://github.com/daniroc/nx1-guardian.git. Branch refs/heads/main; HEAD UNBORN; no Git commit/tree object. Existing untracked working tree preserved. No network request was used to recheck remote existence or permissions.

All 21 file hashes in docs/fix-01-evidence.json matched, and the evidence file itself matched SHA256 `57976f367b7dd294094dcbcfe4c60ff9a32a2f56ad1a69a9c91a3cc3c737b72a`. Total 22 artifacts. Original review SHA256 `b4975c67ca5882511013d70e56e8c911874e828186a457448aed6f8e6b313d9a`; original probe results `0740dbde1b0552f5ef6c7acbd0a44359eda361e96e265d3c5908e136a9bec4d9`. Historical evidence remains intact. Sorted artifact-manifest SHA256: `762f34556bf39a5ecb7785567c32a7d3f1248caccb572c662907b9f390ebea25`; this is a file manifest, **not a Git tree hash**.

A separate reviewer agent, /root/reaudit_reviewer, received a fresh review assignment without implementer conversation history. It inspected source, tests and documents independently; parent designed and executed external-fixture probes. Both identified the early emergency outage gap. The reviewer also assessed the independently reproduced acknowledgment defect as P2 and agreed on conditional disposition. The parent is the implementation assistant, and both reviewers share one environment. This is a **non-external review, not independent third-party attestation**. No autonomous agent collaboration system, provider integration or externally administered service was activated.

## Execution and original finding verdicts

Existing suite: **48 executed, 48 pass, zero fail/cancel/skip/todo**. Original 35 cases plus 13 FIX-01 cases were used unchanged. The compiled tests were executed with the original single-process/no-subprocess runner settings, from G02A-REAUDIT-01-run so relative .lab-tests fixtures stayed outside the checkout. Command:

`node --permission --allow-fs-read=.. --allow-fs-write=. --allow-fs-write=.lab-tests/* --test --test-isolation=none --test-concurrency=1 ../nx1-guardian/dist/test/core.test.js`

pnpm run typecheck (no emit) and pnpm run lint passed. An independent in-memory TypeScript emit matched all 12 existing emitted JS/declaration files byte for byte; no build artifacts were written. All 58 unique traceability rows (T01-T21, C01-C10, A01-A27) exist and their implemented/simulated/infrastructure classifications were reviewed.

| Original finding | Local verdict | Independent challenge |
|---|---|---|
| F01 rejected dispatch mutates owner | VERIFIED_CORRECTED | P01: 64 concurrent rejected/duplicate/foreign/expired grant calls leave the entire ledger unchanged, retain the live owner controller and cause no additional provider start. Valid stop still aborts it. P02: held writer causes rejected dispatch without changing owner state; owner then completes once. P09: dispatch-intent witness failure starts zero effects and remains fail closed after reopen. |
| F02 false stop with another worker active | VERIFIED_CORRECTED for conforming fake adapters; R02 exception below | P03: a second worker cannot confirm stop with DISPATCHING or UNKNOWN, old grants produce zero effects after recovery, global concurrency remains occupied, and UNKNOWN still blocks confirmation after reopen. An already attempted inert effect completes once after STOP_DURABLE, but no STOP_ENFORCED is reported. |
| F03 approval replay across policy/service | VERIFIED_CORRECTED within logical ledger identity | P05: 19 denial scenarios cover independent authority IDs with shared roots, foreign policy/resource/subject/epoch, action substitution, duplicate/noncanonical control JSON, wrong roles and reused IDs. P06: foreign-policy and old-lock recovery approvals cannot unlock, while an exact original-context approval survives reopen. |
| F04 noncanonical signature alias | VERIFIED_CORRECTED | P07: 370 vectors including 16 canonical positives, 240 tail aliases and 96 malformed encodings. Instrumentation shows aliases/malformed encodings never call crypto.verify; valid signatures call it once. Altered signed values fail. The RFC8032 empty-message raw Ed25519 vector verifies, and its signature fails the NX1 domain-separated message. |

Ten independently designed probe groups: **8 PASS, 2 reproduced P2 violations, zero harness errors in the completed probe run**. These are group counts, not ten new repository unit tests. Additional P08 detects an actual missing audit tail entry across reopen. Evidence is in G02A-REAUDIT-01-probe-results.json; its process exit 0 means the probe run completed, not that all security invariants passed.

An initial test-launch path error and an initial in-memory compiler resolution error from the parent directory were retained in logs. The launch path was corrected, and compiler parity was rerun from the project directory with the same source/config. Neither harness failure is attributed to Guardian or counted as a passing security test.

## New findings and concrete disposition

### R01 — P2: preliminary evidence outage bypasses the local emergency fallback

Location: src/guardian.ts:60,83-95. A signed stop first calls store.inspect outside stop's try/catch. If mandatory witness read fails, no STOP_UNCONFIRMED is returned, no local fence is installed and the owner controller is not aborted. Existing outage tests inject witness.advance failure, which occurs later and exercises a different path.

Reproduction P10: start an inert barrier dispatch; construct a current dual-signed stop; set the synthetic witness read adapter to throw READ_UNAVAILABLE; administer throws; observe ownerSignalAborted=false and durableLock=false. Restore the read adapter and release the barrier; dispatch returns COMPLETE with one inert completion. This demonstrates the missing local fallback/reporting path. It does not forge administrative authority: signature validation succeeded, but current authority/epoch validation could not complete during the outage. No automatic durable emergency guarantee is inferred.

Required resolution: specify an evidence-outage emergency path that preserves exact authority/policy/subject binding, normalizes the unconfirmed result and safely handles locally known work, or explicitly narrow the laboratory contract and accept the limitation. Do not indiscriminately fence on every signed foreign command. Add read-null/read-throw/corrupt/stale/closed-ledger tests with active owners, foreign commands and authorized recovery. Expected evidence: accurate stop status, explicitly bounded local containment, no foreign approval authority, no automatic clearing of uncertainty. External durable emergency infrastructure remains an independent prerequisite.

### R02 — P2: truthy nonboolean cancellation values support a false acknowledgment claim

Location: src/guardian.ts:99-105. cancel/revoke results are tested by truthiness. A Promise resolving false is truthy and supplies no affirmative acknowledgment, but STOP_ENFORCED is returned when the ledger has no pending operations.

Reproduction P04: lock an empty synthetic session, verify literal false cancellation yields STOP_DURABLE, then call confirmStop with cancel/revoke returning Promise.resolve(false). Actual result: STOP_ENFORCED. The adapter violates the declared synchronous boolean TypeScript interface; it is a malformed trusted-adapter case. There was no active operation, hidden effect or demonstrated privilege escalation. This is a runtime validation/reporting defect rather than reappearance of the original cross-worker P1.

Required resolution: accept only explicit primitive true acknowledgments, reject nonboolean results fail closed and keep asynchronous cancellation pending until verified if such adapters are ever introduced. Add false/null/object/string/promise/delayed rejection and positive-true cases with both idle and active ledgers. Do not invent real cancellation receipts in this lab.

Neither finding automatically authorizes implementation. For unconditional local gate closure, fix and re-audit, or obtain explicit narrowly scoped acceptance of the documented P2 limitations. No P0/P1 was located within this bounded review; this is not proof of their absence.

## Boundaries, oracle weaknesses and residual risks

SQLite reservations and event changes use BEGIN IMMEDIATE; busy contention denies admission. Witness advancement is a separate transaction and can permanently freeze a committed intent. Reopen is not process-crash or power-loss evidence. Pending uncertainty is deliberately neither reconciled, refunded nor retried. Hash chains and signatures detect the exercised tampering only while an honest checkpoint remains; append-only SQL triggers do not provide immutable external custody.

The 48 tests measure same-process interleavings across two connections, not parallel processes. The inert barrier strengthens the original ignored-cancellation oracle by producing one observable completion after durable stop. Existing assertions do not cover preliminary witness-read outage or malformed cancellation return types; these are R01/R02. The historical test called reordered/truncated audit actually exercises an old witness rollback; P08 supplies a real missing-tail test, but comprehensive reorder/two-store crash schedules remain open. scripts/evidence.mjs is explicitly historical and still consumes the original 35-test bootstrap log; it was not used as current proof or rerun.

The separate reviewer noted a preliminary-context/transaction TOCTOU availability window: another worker can stale a valid stop before its transactional revalidation, after the local fence/abort. No privilege bypass was reproduced; true multiprocess ordering remains unverified. Caller-owned grant mutation/accessor/proxy objects are trusted composition/code-capable concerns; the current agent boundary is canonical JSON, and no hostile code-capable transport was exercised or secured.

F03 identity is a persisted logical ledger UUID. Copying both ledger and witness copies that identity; clone prevention and physical service identity remain external custody prerequisites. Trust roots, witness, host and native dependencies are trusted in this lab. Compromising them can invalidate assurance. Production host confinement, real MFA, independent immutable audit, TCB provenance, provider cancellation, real model quota/billing enforcement and power-loss durability remain unverified.

Dependencies: no runtime registry packages; development graph unchanged (typescript 5.9.3, @types/node 26.1.0, undici-types 8.3.0). Lock SHA256 `92b8278d7721ce824b3a5835e8c8787444d4ce627e94c7c87b461e8c643b7c48`, installed version/manifest records checked. Neither installed tarball provenance nor binary authenticity was established. No fresh registry advisory audit was run. Node 24 with Node 26 declarations and experimental node:sqlite remain recorded prerequisites, not new claims of compatibility/security assurance.

T01-T21/C01-C10/A01-A27 infrastructure gaps stay open: direct agent tool bypass, hostile executor confinement, approved-release provenance, external administration/audit, real provider integration and all absent education/storage/browser channels are not mitigated by structured text or agent promises. The local tests do not close those risks.

## Recommendation and evidence

The original four corrections can be accepted as locally reproduced corrections with the stated boundaries. Overall result is CONDITIONAL_PASS; **do not close the broader local gate unconditionally while R01/R02 lack correction or explicit disposition**. Recommend considering a separate G02A-1 authorization only after that disposition and review, with the already required externally controlled disposable offline environment and no real credentials/providers. No G02A-1, Nexus integration, deployment, production permission change or autonomous collaboration activation is authorized by this review.

Reproduction scripts and all logs use prefix G02A-REAUDIT-01- in the checkout parent. The baseline-before/after JSON files record the exact 22 artifacts, 12 emitted-file hashes, dependency manifest hashes and 58 row IDs. G02A-REAUDIT-01-evidence.json binds final report/probe/log hashes and preservation checks. Original review and FIX-01 evidence are untouched. Final protected checkout changes: zero; all new artifacts are external audit evidence.

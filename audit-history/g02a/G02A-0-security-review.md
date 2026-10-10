# G02A-0 adversarial review

**RESULT: FAIL. G02A-1 start is not recommended.** Three P1 laboratory-core defects and one P2 canonical-authentication defect were reproduced without changing repository source, original tests or documentation. The existing suite still passes 35/35, demonstrating that it misses these scenarios. No deployment, production integration or security pass is authorized.

Reviewer limitation: this is the same assistant/tooling chain that authored the implementation. It is a separate evidence-based adversarial review, **not an independent external attestation**. External independent review remains a blocker after remediation.

## Exact baseline

- Repository/local origin: `https://github.com/daniroc/nx1-guardian.git`.
- Checkout: `C:/Users/DaniR/.codex/visualizations/2026/10/09/01a12251-4e43-7ce2-8dc5-e4b92fff3ee9/nx1-guardian`.
- Branch: `refs/heads/main`. HEAD: **UNBORN**; `git rev-parse --verify HEAD` fails because no commit exists. There is **no Git tree object to report**. No commit/index mutation was made to manufacture one.
- Worktree: all 20 delivered files are untracked; existing `.gitignore`, README, docs, manifests, scripts, src, test and tsconfig groups preserved.
- Exact SHA256 artifact-manifest digest: `6c1b8a72d4e29bcd566e1b314b0209fa3b974c7b62b6cd27a89414d00db5c249`. This identifies the sorted path/hash manifest, **not a Git tree hash**.
- All 19 hashes listed in prior `docs/evidence.json` match; that file itself is included as the twentieth file in the new baseline. In-memory TypeScript compilation reproduces all existing emitted JS/declarations byte-for-byte without writing artifacts.
- Before/after evidence: `G02A-review-baseline-before.json` and `G02A-review-baseline-after.json`; preservation=true. No functional, test, source, manifest, lockfile or prior documentation changes. Only new ignored fixture directories and external review artifacts were written. Nexus was not modified or audited again.

All 20 files were read and reviewed. Source, 35 tests, architecture/contracts/dependencies/risks/validation, evidence generator and T01–T21/C01–C10/A01–A27 traceability were cross-checked. Installed development manifest versions match TypeScript 5.9.3, @types/node 26.1.0 and undici-types 8.3.0. Lock SHA256 matches `92b8278d7721ce824b3a5835e8c8787444d4ce627e94c7c87b461e8c643b7c48`; documented SRI fields match the lock. Tarball bytes, publisher provenance, native Node/SQLite/OpenSSL/V8 integrity and fresh advisories were not independently verified. No package installation or audit-network request was made.

## Findings

### F01 — P1: rejected dispatch mutates another active operation and removes its controller

Evidence: `src/guardian.ts:170` and `:172`; authentication happens at lines 141–143, but the shared catch/finally runs even if that authentication fails. The catch uses untrusted `grant.session`/`grant.execution` to change an existing DISPATCHING operation to UNKNOWN and terminalize the session. Finally deletes `aborts[grant.id]` whether this invocation registered that controller or not.

Reproduction: start a legitimate inert barrier read with Codex's valid proof; while it is pending, call dispatch with the same grant but ChatGPT's wrong-subject proof. The attack returns IDENTITY_INVALID, yet the victim changes DISPATCHING -> UNKNOWN, its session becomes terminal, and the legitimate controller disappears. A subsequently signed stop returns STOP_DURABLE and a clean fixture provider permits STOP_ENFORCED while the original effect remains active and its signal is **not aborted**. Releasing the barrier completes one synthetic effect after the reported stop. No new unauthorized provider dispatch is necessary for this state corruption.

Expected: failed identity/grant validation may record a denial but must not alter or terminalize someone else's effect, cancel its ownership or remove its controller. Only an invocation that successfully owns the persisted dispatch claim may settle it; controller cleanup must compare ownership, not only caller-supplied grant ID.

Resolution path: authenticate and claim ownership before side-effect state transitions; separate pre-admission failures from uncertain outcomes; retain per-dispatch ownership/fencing identity for cleanup and audit. Add regression covering unauthenticated/duplicate calls while the legitimate operation is DISPATCHING. **Blocks G02A-1.** Trace: T01/T02/T07/T10, C02/C05/C06/C09, A09/A11/A22.

### F02 — P1: STOP_ENFORCED ignores other workers and persisted active effects

Evidence: `src/guardian.ts:85–90`. Confirmation checks only this instance's in-memory abort map and the provider supplied to that call; it does not inspect all persisted DISPATCHING/UNKNOWN effects or bind confirmation to their actual provider/worker instances.

Reproduction: Guardian instance A begins an inert barrier effect. Guardian B shares the same database/witness and performs a properly dual-signed stop. B's abort map is empty; confirmation using a fresh normal fake provider returns STOP_ENFORCED while the ledger still says DISPATCHING, A's signal is not aborted, and its effect is still pending. Barrier release produces completedAfterEnforced=1. This is a same-process, two-instance fixture, not a process/network escape test.

Expected: durable admission freeze is not evidence of enforced cancellation. A worker/cancellation/revocation registry must be durably reconciled before confirmation; unresolved accepted work must keep STOP_DURABLE or STOP_UNCONFIRMED. A fresh idle provider's acknowledgment cannot speak for a different active provider. Persisted UNKNOWN effects also need honest handling after restart.

Resolution path: bind effects to a durable worker/provider identity and epoch; use actual cancellation/revocation receipts; prevent multiple service owners or explicitly support fenced ownership; verify persisted outstanding work before reporting enforced stop. Add multi-instance/reopen/unknown-effect regressions. **Blocks G02A-1.** Trace: T10/T15, C06/C09, A11/A14/A17/A22.

### F03 — P1: administrative approval is replayable across different policies/projects, including recovery

Evidence: `src/contracts.ts:17`, administrative schema at lines 78–82, and `src/guardian.ts:45–65`. Signed AdminCommand lacks project, repository, policy digest/epoch and a unique service/authority instance identity. `audience=guardian-lab-admin`, command IDs and emergency epochs are scoped only by the local store.

Reproduction: initialize two independently bootstrapped synthetic policy stores A and B with different project/repository/policy digests, sharing the same legitimate administrator identities. A's exact signed open command also returns OPENED on B and permits a B-scoped synthetic read. Then independently stop both stores. The dual-signed recovery command prepared for A also returns RECOVERED on B; B.locked becomes false. No admin signature was forged: the missing target binding makes authentic approval reusable in the wrong authority context. Per-store replay IDs do not prevent cross-store reuse.

Expected: approval for A must not open or recover B. The signed administrative intent must include and validate the exact authority instance, project/repository, active policy digest/epoch, emergency epoch, action and session scope. Do not depend on an unspecified future transport to supply missing cryptographic intent binding.

Resolution path: extend closed admin contracts and signatures with explicit authority/target/policy bindings and appropriate replay namespace; check these before any fence/state mutation. Add cross-policy open/stop/recovery replay regressions, including shared legitimate administrator keys. **Blocks G02A-1.** Trace: T03/T04/T07/T09/T10/T17, C01/C03/C04/C06, A08/A20/A21/A22/A26.

### F04 — P2: noncanonical base64url signatures accepted

Evidence: `src/contracts.ts:47–49`. Regex validates alphabet/length, but Buffer's permissive decoder accepts nonzero unused trailing bits; no decode/re-encode equality check enforces the canonical representation.

Reproduction: generate a valid 64-byte Ed25519 signature, increment its final base64url alphabet index by one, and verify. Both strings decode to identical bytes; authenticated() accepts the changed representation. This is **not an Ed25519 forgery**, and no replay bypass was demonstrated; it violates the stated strict canonical signature profile.

Resolution path: require decoded length 64 and exact unpadded base64url round-trip equality before verification; test noncanonical tail bits, invalid alphabet/padding, key/algorithm mismatch and the positive canonical case. No update made. **Must be resolved or explicitly dispositioned before a strict-contract acceptance.** Trace: T04, C03, A05/A26.

P0: none identified in this credential-free scope; that does not establish absence in an integrated/production system. P3: no separate finding raised. Prior infrastructure risks remain outside these local defect counts.

## Executed validation and reproduction

Unchanged commands, all exit 0:

- `pnpm run typecheck` -> `G02A-review-typecheck.log`.
- `pnpm run lint` -> `G02A-review-lint.log`.
- `pnpm test` -> **35 tests / 35 pass / 0 fail / 0 skip**, `G02A-review-original-tests.log`.

No build command was run; compiler parity was checked in memory. The original tests were not edited. Their positive authorization, invalid signatures/roles, dual approvals, atomic held writer, replay, budgets, witness corruption and connection reopen tests reproduce their narrow claims. However, the concurrency case schedules synchronous admissions on one event loop, not simultaneous processes; persistence is connection reopen, not process crash/power loss. The test titled “reordered/truncated audit and old witness” actually rolls back the checkpoint, not all advertised reorder/truncate variants. A15/A18/A19 remain NOT_IMPLEMENTED; many other cases are explicitly SIMULATED.

External inert probes: **4 security invariants checked, 0 passed, 4 reproduced violations**. The probe process exits 0 to save evidence; this is not a security PASS. Fixtures use fresh ignored SQLite directories, synthetic keys, a bounded promise barrier and fake reads only. No real network/provider/credential/hostile-code effect occurred.

From the external visualization root, reproduce without modifying the 20 files:

```powershell
node G02A-review-baseline.mjs before
node --permission --allow-fs-read=. --allow-fs-write=nx1-guardian/.lab-tests/* --allow-fs-write=G02A-review-probe-results.json G02A-review-probes.mjs
node G02A-review-baseline.mjs after
```

Probe source: `G02A-review-probes.mjs`; exact results: `G02A-review-probe-results.json`; console evidence: `G02A-review-probe-output.log`. The scripts never edit repository source/tests/docs. Their signatures and temporary directory names are synthetic/random; logical outcomes are reproducible.

## Readiness and remaining limits

**Do not start G02A-1 on this core baseline.** First obtain separate authorization for an audit-driven correction task for F01–F03 and canonical-signature correction/disposition F04, retain these failure fixtures, and rerun independent review against a new exact artifact baseline. This audit itself authorizes no functional change. The same assistant cannot supply external reviewer independence by calling this review independent.

Even after local fixes, G02A-1 needs separately authorized, externally prepared disposable offline VM/supervisor, independently controlled identity/release roots, filesystem/network containment and host observations. Synthetic quotas are not subscription quotas; SQLite FULL/reopen is not power-loss proof; signatures are not real MFA; local triggers/hash chains/witness are not independent immutable storage; compiler version/SRI fields are not TCB provenance; fake cancellation receipts are not provider cancellation. Ledger/witness mismatch intentionally fails closed with no implemented recovery reconciliation, and trusted host/witness collusion defeats local assurance. These infrastructure/external-security blockers are not closed by passing laboratory tests.

No deployment, Nexus integration, production policy change, permission change, commit, push, merge, autonomous communication or real provider call was performed or recommended. All 20 original artifacts and emitted build bytes remain unchanged.

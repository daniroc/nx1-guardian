# G02A-0 validation evidence

## FIX-02 current evidence (2026-10-10)

REAUDIT-01 returned CONDITIONAL_PASS with R01/R02 P2 findings; that report remains unchanged outside the checkout. Seven regression cases were added before implementation. The compiled red run executed 55 tests: 49 pass, 6 fail, including the 48 prior passing cases. FIX-02 now executes **55/55 pass**, zero fail/cancel/skip/todo; typecheck, lint, build and source/dist parity pass. Original 48 test bodies are retained; the witness fixture adds a read-outage switch. See fix-02.md and fix-02-evidence.json for scope, hashes, logs, preservation and limitations. Earlier evidence files are historical and unchanged. G02A-0 closure and later stages still require successful focused re-audit and explicit authorization.

## FIX-01 historical evidence (2026-10-10)

The original bootstrap evidence below is historical. The subsequent read-only review returned FAIL (F01-F04). FIX-01 validation now executes **48 tests: 35 original cases plus 13 new cases; 48 pass, 0 fail/cancel/skip/todo**. Typecheck, lint and build pass. A compiled pre-fix run executed 41 tests: 36 passed and 5 failed, reproducing F01/F02/two F03 scenarios/F04; the existing 35 remained passing. An earlier harness compile failure is retained separately and is not regression proof. See fix-01.md and fix-01-evidence.json for current hashes and logs. Original docs/evidence.json and prior review evidence remain unchanged; scripts/evidence.mjs is the historical bootstrap generator and was not rerun.

This establishes local correction evidence only. Independent re-audit, G02A-1 authorization, external infrastructure and production approval remain outstanding.

## Historical bootstrap evidence

Date: 2026-10-10 Europe/Madrid. Result: **LOCAL_CORE_PASS_PENDING_INDEPENDENT_REVIEW**. Production integration remains blocked; G02A-1 execution remains unauthorized. Broader coverage gaps are explicitly classified in traceability.md and risks.md.

Baseline: read-only GitHub metadata independently confirmed public `daniroc/nx1-guardian`, size 0, default_branch main, pull/push permissions true. Collaborator-permission query returned 403; no write was used as a permission probe. Clone with `--branch main` failed because empty repositories have no main ref yet; ordinary credential-helper-disabled HTTPS clone succeeded and reported empty repository. Local origin is that exact URL, symbolic HEAD refs/heads/main, no initial files or commits. HEAD remains **UNBORN**; no commit, push, merge, repository creation or permission change was performed.

Independent local directory: `C:/Users/DaniR/.codex/visualizations/2026/10/09/01a12251-4e43-7ce2-8dc5-e4b92fff3ee9/nx1-guardian`. Nexus was only read for reference documents. No Nexus package graph, runtime module, secret, build or application test was imported/run. No changes to its prior findings or files were issued.

Exact final commands and outcomes:

| Command | Outcome |
|---|---|
| pnpm install --offline --ignore-scripts | PASS; reused 3, downloaded 0, development closure only |
| pnpm run typecheck | PASS, exit 0; TypeScript strict + unused checks |
| pnpm run lint | PASS, exit 0; dynamic-code/network/child-process/unsafe-type capability lint |
| pnpm run build | PASS, exit 0; ESM + declarations |
| pnpm test | PASS, exit 0; 35 tests, 35 pass, 0 fail/cancel/skip/todo |

Test script: `node --permission --allow-fs-read=. --allow-fs-write=.lab-tests --allow-fs-write=.lab-tests/* --test --test-isolation=none --test-concurrency=1 dist/test/*.test.js`.

The tests include positive authorization/receipt, both malicious agents, collusion, forged approvals, schema mutations, replay, parent accounting, 16 competing admissions across two SQLite connections, a held write transaction, expired/revoked identities, wrong sender/grant, signed stop/recovery, ignored cancellation, cost/token/iteration/admission limits, ledger/witness/audit corruption/outages, reopen persistence and uncertain-effect/crash fixtures. A 32-case deterministic binding mutation loop admits no unauthorized effect. Reopen tests close and reopen connections in this trusted process, not a real operating-system crash. Cryptographic key material is randomly generated synthetic test data; authorization assertions, timestamps, caps and provider fixtures are deterministic.

Earlier failures are retained in external logs: test compiler narrowing and conservative runtime validators were fixed; the initial Node test runner tried to spawn subprocesses and was changed to single-process isolation; Windows temp-prefix permissions required explicit fixture descendants; direct fsync was unavailable under Node permissions, so witness persistence was implemented using separately signed SQLite FULL transactions rather than weakening runner permissions. The first executable suite after that change had 26/28 passes: an undispatched reservation remained held after stop, and a corruption fixture built its request after corrupting its ledger. Stop now cancels only undispatched reservations without refund; the fixture now constructs its request before corruption. Subsequent suite passed 28/28, then expanded checks passed 34/34 and final held-lock test passed **35/35**. These prior failures are not represented as passed runs.

External log paths relative to this checkout: `../G02A-0-typecheck.log`, `../G02A-0-lint.log`, `../G02A-0-build.log`, `../G02A-0-tests-final.log`; historical failed runs: `../G02A-0-tests.log`, `../G02A-0-tests-second.log`, `../G02A-0-tests-third.log`, `../G02A-0-tests-fourth.log`. Source/evidence hashes and traceability checks are recorded in `docs/evidence.json`.

No core or test imports network, shell/subprocess or worker APIs; capability lint verifies those source restrictions. Provider attempts/completions/token/cost units are synthetic observer counters, independent of agent text, never real network effects. Bootstrap metadata/clone are the only network operations in this iteration. Offline install made no downloads. No real provider/paid model API, credential use, hostile code or escape test was executed. This is source/command evidence, not packet-capture proof or independent host isolation.

Synthetic test database/witness files are ignored by Git and retained for local inspection. Audit events contain synthetic IDs/state; no real user/project data. Lab retention is manual, with no production privacy/immutable-retention guarantee. A real deployment needs externally approved retention, encrypted access controls, incident reconstruction, backups and witness custody.

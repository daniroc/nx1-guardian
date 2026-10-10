# Continue Guardian on another device

The user authorized committing and uploading this standalone repository to daniroc/nx1-guardian. This publication preserves the credential-free local prototype through GUARDIAN-G02A-0-FIX-02. It does not authorize G02A-1, Nexus integration, real providers, credentials or deployment.

## Current state and next task

FIX-02 addresses R01 (early evidence-read outage bypassed local emergency fallback) and R02 (truthy nonboolean cancellation acknowledgments). Latest implementation validation: 55 tests pass, 48 previous test bodies retained, typecheck/lint/build pass and 12 emitted files match source. Focused independent re-audit of FIX-02 is still pending. G02A-0 closure, G02A-1 and production remain blocked until successful re-audit and separate authorization.

Read [FIX-02](fix-02.md), [current evidence](fix-02-evidence.json), [architecture](architecture.md), [contracts](contracts.md), [risks](risks.md) and [traceability](traceability.md). The local fallback and pending incident are in memory; cached authority supports containment only. Real cancellation, process/power-loss durability, multiprocess isolation, immutable external audit, MFA, TCB provenance and real quotas remain unverified.

## Checkout and validation

```sh
git clone https://github.com/daniroc/nx1-guardian.git
cd nx1-guardian
pnpm install --frozen-lockfile --ignore-scripts
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm test
```

Use the recorded Node 24.21.0 and pnpm 10.28.1 environment, or explicitly review compatibility before changing it. On a new device, dependency installation can require approved public registry downloads; use --offline when the exact cached artifacts exist. No npm command or lifecycle script is needed. No production credentials or .env file is required. The test provider and signing identities are synthetic. Installed dependencies, generated dist and .lab-tests databases are intentionally excluded from Git.

## Preserved audit history

The audit-history directory contains G01/G01-R design documents, selected G01-R2 review/minimal-audit records and all external G02A reports, logs, probes and validation scripts that accompanied this checkout. audit-history/manifest.json records SHA256 hashes of those exact archived bytes. Private Nexus dependency-tree payloads, workspace graphs, repository checkouts, installed dependencies, test databases and credentials are excluded.

Historical reports retain their original UNBORN baselines, timestamps, file counts and absolute local paths. They are evidence of those iterations, not the current commit state. Old references of the form ../G02A-* now resolve by filename within audit-history/g02a. Archived scripts retain their original directory assumptions: inspect and adapt them in a separate external audit workspace before execution. Do not run the historical scripts/evidence.mjs as a current evidence generator; it consumes bootstrap-era logs.

For a focused re-audit, preserve this commit and all historical evidence, verify the current source hashes, run the 55 existing tests and independently challenge R01/R02 and F01-F04. Generate new evidence outside the protected checkout. Do not silently alter tests or mark production controls passed. Publication itself adds handoff/history files and establishes a Git commit; earlier 24-artifact evidence still describes the implementation before publication.

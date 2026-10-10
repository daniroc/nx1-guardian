# G01-R2 separate-reviewer packet

Decision requested: validate the current-main finding classifications and outstanding evidence requirements. G02A is NOT_AUTHORIZED. Result is BLOCKED_EVIDENCE_GAP, not SECURITY_PASS. This packet was produced by the same assistant that authored G01; it does not constitute independent attestation. Nothing has been sent to another reviewer automatically.

## Identity and scope

- Repository: daniroc/nexus; remote main checked at start and completion.
- HEAD: `4fe297ad601e97d70589c42ef24ac9399cd951ac`.
- TREE: `a280aea5a5be754bc55bf843e99aa801073f5908`.
- Prior HEAD: `44ea6fee49fa13d3a10b8081b71c7f368480972d`.
- Common ancestor: `16cefe112ce47742ff5385b2b6196b1b8adf0ecb`; current ahead 243 / previous ahead 28.
- Exact tree checked out independently under the visualization root; tracked source diff remains clean. All review additions are new docs/guardian/G01-R2 files. Current tree recovery verified Git object hashes, not just copied file labels.
- Initial managed-worktree creation added shared Git bookkeeping in the original repository; no original product files/documents were edited. It was stale and was not used for source audit. Complete historical commit/object hydration was not obtained.

## Evidence entry points

1. [Current-main report](G01-R2-current-main-revalidation.md): six finding dispositions, B01–B08 classifications/severity/ownership, all original threats/controls plus new architecture risks, current authority chains and scope/retention/credential limits.
2. [Machine-readable report](G01-R2-evidence.json): final result fields and exact focused test counts.
3. [Route/source/credential inventory](../../../G01-R2-inventory.json): 2,478 tracked files, 125 server modules, 19 server-page modules, 24 background candidates, 359 source authority modules, imports/symbols/lines and 79 credential selectors with no values. This is static overapproximation, not live deployment/IAM proof.
4. [Prior-to-main path diff](../../../G01-R2-security-path-diff.txt), [ancestor-to-prior](../../../G01-R2-ancestor-to-prior.txt), [ancestor-to-main](../../../G01-R2-ancestor-to-main.txt), [remote comparison](../../../G01-R2-remote-comparison.json). Remote comparison's 300-file response is capped; use local tree diffs for scoped current paths. Full per-commit attribution remains unresolved.
5. [Production dependency graph](../../../G01-R2-production-dependency-graph.json), [local dependency review](../../../G01-R2-dependency-local-review.json), [source build log](../../../G01-R2-build.log). Offline frozen install reused 246 packages; scripts disabled, zero downloaded. Existing build passed. Lock SHA-256: `3aeff1b09f55767254aa1db99690ce80e7b81bf93fbb23dad009f69996b3f67b`.

## Test evidence

| Run | Outcome | Evidence |
| --- | --- | --- |
| Core/GitHub/currentness/dependency policy | 22 passed / 0 failed | [log](../../../G01-R2-focused-core.log) |
| Integrated security and original boundary fixtures | 87 passed / 0 failed | [log](../../../G01-R2-focused-integration.log) |
| SharedNX1/ProjectApps/Faroleiro/Classroom fixtures | 22 passed / 0 failed | [log](../../../G01-R2-focused-new-architecture.log) |
| GitHub adapters and public submissions | 66 passed / 1 failed | [log](../../../G01-R2-focused-provider-boundaries.log) |
| Fake common-client deadline probe | Success after 76ms with 5ms configured timeout and 50ms fake body delay | [result](../../../G01-R2-body-probe.json), [temporary probe source](../../../G01-R2-body-probe.mjs) |

Total 198 tests: 197 passed, 1 failed, zero skipped/cancelled. Failed Q15C byte-identity oracle at tests/website-native-public-submissions.test.mts:124 differs on current-year/serverYear output and digest. It is already named in current certification's reproduced main limitations; not repaired or represented as a security exploit. Passing domain tests do not prove Guardian enforcement.

## Current findings and blockers at a glance

Six prior findings: DirectToolRoutes STILL_PRESENT; ExistingProviderWrites NEW_VARIANT_FOUND (expanded domain effects); CoarseCredentialScopes STILL_PRESENT; WritableChronicle STILL_PRESENT despite stronger validation; ProviderReportedUsage STILL_PRESENT; common-client UnboundedGitHubBodyRead STILL_PRESENT. No original finding was shown resolved or superseded in its actual scoped claim. Dedicated currentness transport is bounded and tested; do not generalize the common-client finding to it.

All B01–B08 remain critical Guardian assurance prerequisites: independent hosting/repo, independent admin identity/policy, alternate-route confinement, executor/host isolation, durable independent stop/fencing, aggregate approved budgets, external immutable/witnessed audit and real provider/release capability evidence. Current native authorization, capability/revision checks, scoped snapshots and crypto are implemented domain controls; missing Guardian guarantees are not allegations that those guards were bypassed.

Review new variants: GitHub onboarding response.json has no explicit body/deadline limit; management/contact lack uniform independently guarded waits and contact request read lacks an explicit total deadline; integration adds LTI/grade, encrypted files, FCM, signed CRUD and framework deployment/worker dependencies. Traceability includes T01–T16 and T17–T21 extensions, C01–C10, existing tested boundary fixtures and negative obligations from earlier Guardian A01–A27. Guardian adversarial cases themselves remain NOT_EXECUTED.

## Required reviewer/user follow-up

Vulnerability audit is UNKNOWN: automatic approval review rejected pnpm audit --prod --json because it would send production dependency names/versions to an external registry without explicit payload/destination approval. Registry locally resolves to https://registry.npmjs.org/. An approval question is pending; no workaround was used. Absence of CVE evidence is not absence of vulnerabilities.

Secret pattern scan found zero matches in four formats across the tracked tree, with no values printed. This does not attest all secret formats, runtime environment/connector credentials or cloud IAM. Review actual production identity/resource/operation grants, rotation/revocation/cancellation, shared-account telemetry, routes/webhooks/schedules and external storage independently. Do not import secrets into an agent/executor for this review.

Pending decisions must remain human-owned: StandaloneRepository; ExternalOwnerAndReviewer; OfflineLab; ApprovedTestPoliciesAndBudgets; explicit dependency metadata egress approval. Concrete options/risks/recommended defaults are in the report; no option is activated. Obtain actual independent review and close current evidence gaps before requesting any separate G02A authorization. Production remains BLOCKED.

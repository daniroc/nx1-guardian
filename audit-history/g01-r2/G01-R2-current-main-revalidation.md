# G01-R2 current-main revalidation

Result: BLOCKED_EVIDENCE_GAP. Mode: AUDIT_ONLY. G02A: NOT_AUTHORIZED. Production integration: BLOCKED. Same assistant/tooling chain as G01: no independent external attestation. Current-source review, builds, fixture tests and a redacted scan are evidence, not SECURITY_PASS.

## Verified identity and audit setup

GitHub read connector resolved `main` to `4fe297ad601e97d70589c42ef24ac9399cd951ac`; the Git commit endpoint returned tree `a280aea5a5be754bc55bf843e99aa801073f5908`. Recursive remote tree was complete (truncated=false, 2,912 tree/blob entries). Independent local checkout reports the same HEAD/TREE and was clean before review and after dependency installation/build/tests. Its root is `C:/Users/DaniR/.codex/visualizations/2026/10/09/01a12251-4e43-7ce2-8dc5-e4b92fff3ee9/guardian-g01-r2-current-main`. No product source, lockfile, earlier Guardian document, permission, provider or active policy was edited.

Important setup limitation: the initially requested managed worktree used stale local origin/main. Creating it through the app necessarily added shared Git worktree bookkeeping under the original repository's .git. Thus a strict interpretation of DO_NOT_TOUCH including Git administrative metadata was not fully met during setup; no original worktree source or documentation was edited. No destructive cleanup/reset was attempted. That worktree was not the audited baseline. The final audit used a separate no-hardlinks clone/object store under the visualization root; ordinary Git HTTPS access failed, so missing source objects came from the read-only connector. Forty-nine blobs, 36 trees and the current commit were reconstructed and checked against their exact Git object hashes. The complete current working tree, rather than the mixed user workspace or stale worktree, was audited. Earlier history objects are not fully hydrated locally; do not describe this as a complete remote-history clone.

Remote comparison independently confirms previous HEAD `44ea6fee49fa13d3a10b8081b71c7f368480972d`, merge base `16cefe112ce47742ff5385b2b6196b1b8adf0ecb`, ahead=243 and behind=28. The connector comparison returns only 300 changed files; it is not a complete changed-path inventory. Local object/tree diffs provide complete scoped path inventories in [security path diff](../../../G01-R2-security-path-diff.txt), [ancestor to prior](../../../G01-R2-ancestor-to-prior.txt), and [ancestor to current](../../../G01-R2-ancestor-to-main.txt). [Remote comparison](../../../G01-R2-remote-comparison.json) preserves count/merge-base evidence.

Prior Guardian files are absent from this tracked main baseline and remain historical evidence candidates supplied by the previous conversation. No claim below is accepted solely from those documents. Current packet consists only of new R2 report/evidence files; temporary inventory/hydration/probe artifacts are outside tracked product source.

## Six findings reclassified

Evidence below is current source/call-chain or current tool metadata. Reachable means wired in source under its stated auth/configuration conditions, not verified live deployment or possession of credentials.

| Prior finding | Classification / severity | Current authority, chain and executable evidence |
| --- | --- | --- |
| DirectToolRoutes | STILL_PRESENT / critical Guardian bypass prerequisite | Current tool catalog exposes exec_command/apply_patch, GitHub create_commit/update_ref/merge_pull_request, Sites write-credential/deploy/env, Vercel deploy/env/shell/network-policy interfaces. Server effects additionally enter `src/hooks.server.ts:39` -> fresh session/admin/rate policy -> route handler -> scoped composition. No Guardian transport is wired. Backend grants and both agents' effective accounts remain unverified; metadata is not successful access proof |
| ExistingProviderWrites | NEW_VARIANT_FOUND / critical mediation prerequisite | Existing source path remains: `createSourceWriteComposition` in `src/lib/server/integrations/source-write-composition.ts:16` -> Phase63 typed executor -> `createGitHubSourceWriteProvider.updateOne` -> GraphQL expectedHeadOid. Publication uses `github-website-publication-provider.ts` publishAtomic; provisioning uses `github-provisioning-provider.ts`. Main also wires signed external management CRUD, Classroom grade/storage/LRS, Faroleiro storage/push and public contact delivery. `tests/source-write-service.test.mts`, GitHub provisioning/publication tests and integration suites exercise fixtures, not real accounts |
| CoarseCredentialScopes | STILL_PRESENT / critical credential boundary prerequisite | `GITHUB_TOKEN_PERMISSION_PROFILES` in `src/lib/server/integrations/providers/github/github-auth.ts:12` includes repository_create_only=contents:write, PR write and administration write. Narrow application adapters do not narrow the bearer token itself. Current `github-provider.ts:104` explicitly blocks protected create paths even though package.json can be read. `tests/github-provider.test.mts` proves manifest read/blocked-write behavior; real returned token rights, IAM and rotation are unverified |
| WritableChronicle | STILL_PRESENT / critical independent-audit prerequisite | `createFileChronicle` in `packages/nx1-chronicle/src/index.ts:220` validates entries, then adapter.write rewrites all records using writeFile at line 237. Canonical reconstruction/tamper validation improved on main; immutable external storage, sequence witness and deletion prevention remain absent from that adapter. `tests/nx1-chronicle.test.mts` passes, but is not WORM/IAM proof |
| ProviderReportedUsage | STILL_PRESENT / critical metering prerequisite | `FixedJsonProvider` runtime in `packages/nexus-ai-provider-runtime/src/index.ts` bounds bytes/time, validates input_tokens/output_tokens at lines 319–320, and records both local byte counts and provider token metadata. `src/lib/server/provider-runtime-composition.ts` resolves server-owned config/secrets/project/branch authority. `tests/provider-runtime-production-composition.test.ts` and firestore-store tests pass. No exact account token/spend/subscription cap follows from numeric telemetry |
| UnboundedGitHubBodyRead | STILL_PRESENT / high transport finding | `createGitHubHttpClient.requestJson` clears timer at `src/lib/server/integrations/providers/github/github-client.ts:35`, then `parseJsonBody` awaits response.text at line 64 without an adapter byte ceiling/whole-body deadline. Provider, explorer, source-write, publication and initialization compose this client. Temporary no-network probe used timeout=5ms/body delay=50ms and returned success after 76ms. Dedicated `createBoundedRepositoryCurrentnessGitHubClient` is a different, bounded authority; its five hostile transport tests pass and must not be labelled unbounded |

Resolved original findings: NONE established for these six scopes. Superseded original findings: NONE established. Do not infer this from unchanged filenames: source/body, callers, diffs and tests were checked. Improvements on main are material and recorded separately from unresolved Guardian prerequisites.

## Diff reconciliation and certified architecture

For the six prior source anchors, ancestor-to-prior diff is empty in the recorded security scope. Between prior and current, common GitHub client/auth, provider-runtime usage and repository-currentness anchors remain unchanged; Chronicle changes materially. `packages/nx1-core` adds canonical safe-data handling; Chronicle adds stronger canonical entry checks. Actual current code and built artifacts were used for those claims.

Current provider compatibility diff permits reading package.json and omits protected entries during listing, while adding a separate blocked-write check to createNewFile. This fixes read-only inspection compatibility without addressing common transport body bounds or making contents:write a create-only credential. Remote Femenino head `af0db4fba504c49b3685d78baf3b584e1df10492` is titled 'persist read-only repository links without write grants'; current tests exercise the explicit read/write split. This narrower application behavior is not a Guardian enforcement service.

Current merge history evidence includes `dba858e44317d2997adb923420b996a603939086` composing Femenino diagnostics/manual workflows and `bf5b2b6d38d98108de60ee7ec7e2d96ec06103e1` integrating SEO V2; `ef7248abfbc65bcae2cce8cfec1309e0c92dc248` freezes composition, `7bce3f229a17bda8d85994dc51f438e8769f1b93` replaces tracked TLS fixtures, and current HEAD fixes test whitespace. These commit identities/parents were read remotely. Complete per-commit ancestry/file attribution was not reconstructed; the reviewed current tree and scoped before/after diffs are authoritative for finding classification, while exhaustive chronology remains an evidence gap.

`docs/certified-integration/source-matrix.json` records SharedNX1, VirtualClassroom, Faroleiro/ProjectApps/multiframework, SEO Audit V2 and Femenino reconciliation. That is declared integration provenance, not independently executed security assurance. Current executable seams are:

| Integration | Current source boundary and focused test |
| --- | --- |
| SharedNX1 | `packages/nx1-core/src/data.ts`, package manifest shared metadata and safe snapshots; shared-reference-host/adoption tests execute current built packages |
| VirtualClassroom | `src/lib/server/classroom/native-binding.ts`, `native-runtime.ts`, `native-access.ts`, `native-protocol-runtime.ts`, `native-integrations.ts`; native/protocol/LTI/integration/multiproject tests |
| ProjectApps | `src/lib/server/project-app-composition.ts:createNativeProjectAppService` -> fresh authorization/project configure -> `project-app-service.ts:createProjectAppService` -> installation CAS and Faroleiro adapter; project-app-installation test |
| Faroleiro | `src/lib/server/ensemble/composition.ts`, `http.ts`, `firebase-score-files.ts`, `firebase-notifications.ts`; capability/recipient/project binding, encryption and hostile push/storage/native tests |
| SEO Audit V2 | `src/lib/server/seo/seo-admin-v2-composition.ts`, `seo-admin-v2-http.ts`, `seo-history-v2.ts`, search/rendered adapters; hostile target/provider/immutable-snapshot test |
| Femenino management | admin management route -> readBoundedJsonBody -> `createProjectManagementAdapter.execute`; resources/capabilities, HMAC actor/project/body binding and bounded CRUD; management adapter/contract/stream-limit tests |
| Multiframework | `src/lib/framework-adapters/`, `src/lib/server/framework-publication-model.ts`, `framework-public-server-source.ts`; generated output remains a separate prospective deployment surface. Q15C compatibility fixture currently fails as already listed in certification baseline |

No cited earlier path is treated as active after absence: current runtime assembly is native-binding/native-runtime, app assembly is project-app-composition/service and audit UI storage is audit-repository. Historical guessed helpers do not serve as current evidence.

## B01–B08 current matrix and ownership

All classifications apply to unresolved Guardian assurance prerequisites, not assertions that ordinary Nexus application guards are absent. Current code proves several application controls, which cannot substitute for external enforcement when agents can act through alternate routes.

| Blocker | Current classification / severity | Current evidence, ownership and required closure |
| --- | --- | --- |
| B01 independent hosting/repository | STILL_PRESENT / critical | No Guardian service among 38 workspaces/current route composition. External hosting/ownership not inspected. INFRASTRUCTURE_REQUIRED + USER_DECISION_REQUIRED: select separate owner/repo/service and reviewed release channel; retain no agent deployment/admin authority |
| B02 administrator identity/policy | STILL_PRESENT / critical | Fresh Firebase authorization/admin/project checks are executable; external Guardian MFA, policy signer/approval expiry/rollback recovery are not established. CODE_RESOLVABLE + INFRASTRUCTURE_REQUIRED + USER_DECISION_REQUIRED: external IdP/MFA/signer/dual approval and recovery evidence |
| B03 alternate authority paths | STILL_PRESENT / critical | Tool catalog and source call inventory include Git/connector/API/shell/browser/hosting/secret/background surfaces outside Guardian. INFRASTRUCTURE_REQUIRED + USER_DECISION_REQUIRED + UNRESOLVED: effective account/network/session inventory and backend denial evidence for both agents |
| B04 isolated executor/lateral access | STILL_PRESENT / critical | Browser proxy/child process remains narrow; new Classroom/Faroleiro project/capability guards pass fixture tests but no independent VM host confinement is verified. CODE_RESOLVABLE + INFRASTRUCTURE_REQUIRED: disposable isolated supervisor/VM/egress/filesystem boundary and project separation tests |
| B05 kill/dispatch/recovery | STILL_PRESENT / critical | Application integration disable/LTI revocation/outbox checks exist; no independent global durable kill registry/dispatch fence/recovery authority established. CODE_RESOLVABLE + INFRASTRUCTURE_REQUIRED + PROVIDER_DEPENDENT: external stop semantics and measured real cancellation/revocation/irreversible outcome handling |
| B06 quotas/approved budgets | STILL_PRESENT / critical | HTTP in-memory rate limits, transport bounds and worker ceilings exist; no durable aggregate agent/provider/account spend ledger or verified subscription quota control. CODE_RESOLVABLE + USER_DECISION_REQUIRED + PROVIDER_DEPENDENT + UNRESOLVED: approved absolute caps, fee bounds, trustworthy telemetry and conservative unknown settlement |
| B07 immutable external audit | STILL_PRESENT / critical | Chronicle file rewriting, localStorage audit, app-owned integration events and create-only SEO snapshots are distinct stores; external retention/witness/independent credentials unverified. CODE_RESOLVABLE + INFRASTRUCTURE_REQUIRED + USER_DECISION_REQUIRED: IAM/retention/witness/privacy and incident reconstruction evidence |
| B08 provider/supply-chain prerequisites | STILL_PRESENT / critical | Current code builds and 197 focused cases pass; one known compatibility case fails. Live scopes/rotation/cancel/billing, release promotion and approved-TCB compromise protection remain unverified. CODE_RESOLVABLE + PROVIDER_DEPENDENT + USER_DECISION_REQUIRED + UNRESOLVED: exact integration capabilities and external release review; malicious trusted enforcement remains residual |

These current-main classes precede any G02 planning decision. G02A remains NOT_AUTHORIZED; no implementation scope is activated or silently approved by this audit.

## Route and mutation authority inventory

[Full local inventory](../../../G01-R2-inventory.json) enumerates 125 +server.ts modules, 19 +page.server.ts modules, 24 worker/notification/scheduling candidates, 359 source authority modules, imports, symbols/line numbers and statically reachable authority candidates. Import traversal is an overapproximation and does not prove an exact callable execution path, dynamic provider configuration or real deployment. Re-exports/dynamic composition/generated apps and effective infrastructure still require individual external verification. Thus the requirement to attest every production-reachable path is not represented as complete.

| Route family / source entry | Auth/project/capability and provider chain | Bounds/rates/audit assurance |
| --- | --- | --- |
| /api/admin/integrations/github/*; repository/provisioning/linking | hooks fresh admin -> route session -> integration/project authority -> App/OAuth provider; create repo/branch/file/PR and installation/link mutations | Hook process-local rate; narrow validators and durable app events; common/onboarding HTTP gaps below; no external Guardian meter/audit |
| /api/admin/projects/[projectId]/repository-explorer, source/update and website | owned project/commercial capability -> explorer/source write/Phase63/publication -> GitHub contents/GraphQL expectedHeadOid | Single-file or exact publication intent and source bounds tested; app custody/commit receipts are not independent audit |
| /api/admin/projects/[projectId]/management | requireAdminSession -> content.use project permission -> closed registry/resource command -> HMAC external CRUD | 256KiB input/5s request reader, 256KiB dispatch, 1MiB streamed response and 10s fetch signal; no adapter-owned Promise race for every body/cancel wait; provider operation ACL and replay/spend control unverified |
| /api/admin/projects/[projectId]/ai/* and page-builder analysis | project ownership/server config/current branch -> provider runtime or Gemini adapter -> managed secret + fixed provider | Runtime request/response bytes, deadlines, immutable run evidence; provider-reported token accounting, no exact spend cap |
| /api/admin/seo/* and project/client seo/v2/* | hooks SEO policy -> session/project/domain ownership -> SEO service -> public web/search/rendered providers | Explicit origin/target/custody validators and provider ceilings; create-only snapshots do not establish external retention/IAM |
| /api/admin/projects/*/apps and /api/client/projects/*/apps | native app composition reauthenticates active project/user, manage requires project.configure -> CAS adapter/installations | Installation revisions tested; underlying Firestore authority remains app owned |
| /api/client/projects/*/ensemble/* and admin counterparts | native HTTP origin/body checks -> current app/project actor/capability -> member/recipient/storage authority -> Firestore/Storage/FCM | Private score AES/key custody, device/project binding and bounded transport tested; service account IAM/cancel/spend outside fixture assurance |
| /api/classroom/[projectId]/[installationId]/* | native host/project/source fence -> participant/course capability -> authoring/files/events/integration/delivery/notification | Native readers/CAS/access tests; own binding before cloud credential use; no Guardian service |
| Classroom LTI token/NRPS/AGS/keys routes | exact protocol route/method exception to browser session -> native-protocol-runtime verified hostname/project -> registered tool JWT/token/scope/replay state | Session exception is intentional protocol authentication, not evidence of an authless route; human launch/authorize/deep-link keeps native session; protocol tests pass |
| public data/select/submission routes | grant/contract identity and closed native authority rather than user session -> public data/submission gateways -> bounded Firestore mutation | Ingress limits and process-local public rate; malicious input tests; no external resource ledger |
| images/media/uploads and auth/admin/organization configuration | route/user/project/source guards -> Google/Firebase/secret/config authority or image/proxy providers | Per-service limits and safe logging vary; source inventory maps candidates, not universal body/IAM compliance |
| apps/website contact and es/contacto page actions | same-origin URL-encoded request -> honeypot/closed fields -> configuredDelivery -> external bearer-authenticated contact endpoint | 8KiB input, 4KiB acknowledgement, process-local rate, 8s fetch signal and idempotency key; inbound boundedText lacks explicit total reader deadline; delivery scope/dedupe/audit unverified |

Mutation providers currently composed in source include GitHub repository/branch/file/PR and atomic publication; external management list/create/update/delete/inspect; Google auth claims/session/Firestore and managed-secret versions; Classroom Firebase files, integration secrets/keyring, learning/LTI scores/outbox and configured LRS delivery; Faroleiro encrypted score storage and FCM delivery; configured public contact delivery. SEO HTTP fetches/search/browser evidence are read providers but still consume external resources and disclose targets. A generic mail adapter beyond configured contact delivery was not established; do not claim provider email delivery from a port name alone. Background drainers repeat authority but running schedules/deployment/webhooks were not inspected.

## Credential scope map without values

The inventory records 79 source credential/config selectors and their paths/lines, not runtime values. Application actor authorization is narrower than several provider credentials. No real key/token was requested or printed.

| Credential class / selector or source | Provider/environment/resource/operation scope | Rotation and blast radius status |
| --- | --- | --- |
| GITHUB_APP_PRIVATE_KEY and OAuth app client configuration | App signing/installation and OAuth flows in GitHub composition/auth/onboarding; selected repository_ids and permission profiles where coded | Config owner, active installations, returned permissions and revocation inventory unknown; an App key can reach its permitted installations beyond one typed request |
| Google/Firebase service-account env/JSON/file or metadata | google-cloud-auth -> Firestore, Auth, Storage, Secret Manager, FCM; project/bucket selected in server composition | Real service account IAM, environment boundaries and rotation unknown; OAuth scope text is not IAM restriction |
| Secret Manager references / SECRET_MANAGER_FIRESTORE_RESOURCE | Managed secret bundle versions; model keys, Classroom integration credentials and score-key custody references resolved server side | Versioned prepare/read is implemented; storage/admin/read privileges and independent isolation unverified |
| NEXUS_AI_PROVIDER_RUNTIME_CONFIG / GEMINI_API_KEY | Server registry selects provider/model/fixed HTTPS endpoint/secret reference; project policy and branch checks | Provider-account allowed operations, billing limits and key lifecycle unknown |
| NEXUS_MANAGEMENT_ADAPTERS | Per-project configured HTTPS endpoint, HMAC secret, resource/capability registry; CRUD payload binds actor/project | Remote signer verification, replay TTL, actual CRUD rights, rotation and endpoint network ownership unverified |
| Classroom LTI keyring and LRS authorization | native-integrations scoped configuration, activeKid/key list/managed version, LRS endpoint and authorization | Generated keyring/configure/disable/retry and audit/CAS tested; live tool keys, revocation/cancel and provider receipt semantics unverified |
| Faroleiro score keys/push service identity | score-encryption-keys, Firebase storage and notifications bound to project/member/bucket | Local cryptographic/capability behavior tested; live IAM/key custody and delivery authority unknown |
| NEXUS_CONTACT_DELIVERY_TOKEN | Configured website delivery endpoint; bearer-authenticated POST of contact content | Remote operation scope, retention/billing/dedupe and rotation unknown |
| ADMIN_AUTH_SESSION_SECRET and browser/connector credentials | Native session and external connector/browser account authority, distinct from application provider keys | Actual identities/sessions/grants are unverified; local egress cannot revoke server-side connector authority |

## Audit, usage and transport conclusions

Chronicle is stronger canonical data validation with a writable file store. `src/lib/audit-repository.ts` includes memory/localStorage storage. `integration-persistence.ts:444` checks existing audit ID then writes through application Firestore authority; onboarding/Classroom/CAS may create events atomically. SEO history creates snapshots and validates digests with an app-managed mutable index. These are not interchangeable with external append-only retention locks. Cryptographic tamper detection, create-only writes and access-prevention/retention guarantees must be evidenced independently; actual cloud IAM or compromised service-account reach remains unknown.

Usage accounting combines locally observed byte/deadline/request counters with provider-reported token counts. Token counts are validated numbers, not trusted provider-account debits. Under-reporting can make telemetry inaccurate; over-reporting can poison evidence or future budget settlement if used uncritically. Current runtime does not establish a Guardian monetary reservation ledger from them. Shared subscription-window percentages and actual spend caps have no verified contract; state UNVERIFIED, never exact. Hook rate limiter uses in-memory buckets and fixed route-family ceilings, not durable cross-worker/account budgets.

GitHub HTTP classes differ: common client is unbounded through text read; onboarding helper at `github-onboarding-provider.ts:8` awaits response.json with no explicit whole-operation deadline/byte bound. Provisioning has a 65,536-byte streamed ceiling and timer retained through reads, but depends on fetch/stream honoring abort, awaits cancellation, and does not independently reject decompression or strictly race each wait. Dedicated repository-currentness client has 32,768-byte/15s guarded streaming and hostile-read tests. File content size checks after common parsing do not bound the original HTTP body. Package.json read-only compatibility did not itself add a common-client bound. No assertion that all provider transport is unbounded or universally bounded is justified.

New variant N01: GitHub onboarding's response.json helper is independently unbounded, regardless of capped pagination (high, source-confirmed). N02: management/contact readers enforce byte counts but lack uniform adapter-owned wait/cancel races, and contact inbound request has no explicit total stream deadline (high review gap, no live exploit claimed). N03: learning/LTI, encrypted private files/push, signed management CRUD and generated framework deployment add privilege/privacy/replay/exfiltration attack surfaces requiring expanded external inventory; these are risk extensions, not claims that passing application guards are broken.

## Threat and control matrices on current main

| Threat | Current evidence/control/test | Residual Guardian gap |
| --- | --- | --- |
| T01 malicious Codex | Closed app commands and source-write tests | Direct tool routes; no external policy gate |
| T02 malicious ChatGPT | Server project/actor checks; provider composition tests | Agent text not external approval; independent admin unverified |
| T03 collusion | App capability/identity checks do not accept agreement | No independently administered agent permission boundary verified |
| T04 forged NX1/approval | Core snapshots/grammar and native typed auth tests | Protocol is data; no Guardian envelope/admin approval authority |
| T05 file/log/web injection | Safe snapshots, sanitized provider output and SEO hostile evidence tests | Cognition/content propagation and allowed disclosure remain |
| T06 replay | CAS, proposal/run persistence, LTI state/outbox tests | Generic external exactly-once and unknown billing settlement not established |
| T07 confused deputy | ProjectApps/Classroom/Faroleiro foreign-project tests | Coarse credentials/connector scope and newly composed provider chains |
| T08 credential theft | Private server selectors, scoped app ports and score-key tests | Runtime IAM/secret exposure paths not attested |
| T09 policy downgrade | App revisions/config validators | External Guardian signed policy/epoch/approval not implemented |
| T10 emergency bypass | LTI revocation/integration disable | Independent durable global kill and externally approved recovery absent evidence |
| T11 runaway loops | HTTP limiter, worker/transport ceilings | Global session/tool/time/concurrency reservation absent evidence |
| T12 quota exhaustion | Runtime byte/deadline tests | Provider metadata/account controls do not prove exact token/spend cap |
| T13 compromised executor | Browser proxy, native capability tests | Host/VM/network/project isolation not verified |
| T14 tampered audit | Chronicle/SEO/Firestore digest and reconstruction tests | Independent immutable retention/witness/permissions not verified |
| T15 outages | Auth freshness and provider error handling tests | Whole service/ledger/audit/kill fail-closed protocol not present |
| T16 dependencies | Frozen pnpm lock; 38-package source build | Vulnerability audit blocked; trusted service/release compromise residual |
| T17 cross-project education/private-file disclosure | multiproject, review and score-encryption tests | Live project IAM/key custody and retained content privacy unknown |
| T18 LTI tool impersonation/grade mutation | protocol/LTI human/authoring tests | Real registration keys, token revocation and issuer trust unverified |
| T19 push/storage recipient abuse | hostile push/encrypted score/native boundary tests | Actual FCM/storage IAM, billing, replay/cancel unknown |
| T20 signed remote CRUD deputy | management closed registry/HMAC/body tests | Remote signature/replay/ACL and monetary operation limits unverified |
| T21 hostile PDF/browser/supply-chain execution | static graph exposes pdfjs-dist/playwright-core and fixture boundaries | Isolated runtime/updates and complete dependency vulnerability review missing |

| Control group | Executable current evidence | Enforcement classification |
| --- | --- | --- |
| C01 external policy/admin | Native session/admin checks, configuration owners | Application partial; independent Guardian admin NOT_IMPLEMENTED |
| C02 default-deny typed operations | Source-write, management, app/Classroom capabilities | Application enforcement tested; no universal gateway |
| C03 authenticated strict messages | HMAC CRUD, LTI JWT/token and closed native requests | Domain-specific tested; Guardian envelope NOT_IMPLEMENTED |
| C04 durable replay/idempotency | CAS/run evidence/LTI/outbox adapters | Domain-specific; external effects and shared ledger UNVERIFIED |
| C05 confined executor/credentials | Browser proxy and server-private ports | No host/VM or connector confinement attestation |
| C06 independent emergency | Integration disable/revocation operations | No independent global kill implementation established |
| C07 aggregate budgets | In-memory HTTP/transport/worker bounds | No exact global account/session monetary ledger established |
| C08 external audit | Canonical Chronicle, app events, SEO snapshots | Tamper validation partial; independent storage/retention unverified |
| C09 fail closed | Session authority errors and scoped provider denials | Application partial; entire Guardian dependency failure protocol absent |
| C10 independent releases | Frozen lock/builds and declared certification | External release promotion/TCB assurance and current CVEs unverified |

## Validation results and remaining evidence gaps

Offline frozen pnpm installation completed: 246 packages reused, zero downloaded; lifecycle scripts disabled. `pnpm run packages:build` completed successfully from this exact source. No upgrade or source fix was made.

| Recorded run | Exact outcome |
| --- | --- |
| [Core/provider focused log](../../../G01-R2-focused-core.log) | 22 tests, 22 passed, 0 failed |
| [Integrated security focused log](../../../G01-R2-focused-integration.log) | 87 tests, 87 passed, 0 failed |
| [New architecture focused log](../../../G01-R2-focused-new-architecture.log) | 22 tests, 22 passed, 0 failed |
| [Provider/submission focused log](../../../G01-R2-focused-provider-boundaries.log) | 67 tests, 66 passed, 1 failed |
| [Fake common-client body probe](../../../G01-R2-body-probe.json) | Returned success beyond configured deadline; no network, source mutation or credentials |

Total: 198 tests, 197 passed, 1 failed, 0 skipped/cancelled. Failure is `Q15C preserves byte-identical Q15B emitters with reads, bindings and local actions when submissions are absent`, at `tests/website-native-public-submissions.test.mts:124`; actual generated output adds serverYear/current-year substitution and changes the files digest against the older oracle. Current `docs/certified-integration/certification.json` already lists this name among reproduced main limitations and explicitly says LOCAL_CONTROLLED/no production certification. It is not newly proven exploitable or silently dismissed; code/tests were not changed to pass it. The certificate's broader historical 3,548-test outcome was not rerun here and is not a fresh result.

Dependency graph was recorded locally in [production dependency graph](../../../G01-R2-production-dependency-graph.json) and [local authority review](../../../G01-R2-dependency-local-review.json). Lock SHA-256: `3aeff1b09f55767254aa1db99690ce80e7b81bf93fbb23dad009f69996b3f67b`. Cloud auth/Firebase, browser automation, PDF workers/parsers, hosting build integration and external-domain adapter packages have material authority or input exposure even without a known CVE. Current vulnerability status is UNKNOWN, not zero vulnerabilities: automatic approval review rejected `pnpm audit --prod --json` because production dependency names/versions would leave the host for an unapproved registry destination/payload. Locally read registry is https://registry.npmjs.org/. An explicit approval question was presented; no workaround or alternative metadata egress was used. Approval remains pending unless the user supplies it separately.

Secret scan read all 2,478 tracked files with private-key-block, GitHub token, AWS access-key and Google API-key patterns; zero candidates matched and no values were printed. The current tree lacks the removed tracked TLS fixture key; generated ephemeral test keys are not production credentials. Pattern absence cannot establish the absence of every secret, unknown format, encrypted credential or environment/mounted secret. No cloud/browser/connector credential values were accessed. Complete external credential/environment verification remains a gap.

Remaining blockers to a complete revalidation claim: unapproved current vulnerability query; live deployment/effective-credential/infrastructure inventory absent; static route/import analysis is not exhaustive runtime mediation proof; complete per-commit history attribution and independent external review absent. These are explicit BLOCKED_EVIDENCE_GAP conditions, rather than a fabricated PASS or unreported test failure.

## Pending human decisions and next safe step

| Decision | Concrete options / recommended default / risk |
| --- | --- |
| StandaloneRepository | Dedicated externally owned Guardian repo recommended; Nexus contract-only consumer alternative retains coupling; defer means no live integration. No repo is created for Guardian implementation |
| ExternalOwnerAndReviewer | Named external security owner plus distinct human reviewer recommended; independent reviewing organization is another option; agents/self-review provide no independence |
| OfflineLab | Disposable offline VM with external supervisor recommended; inert source/unit-only work alternative; ordinary shared-host container/shell lacks the required host boundary |
| ApprovedTestPoliciesAndBudgets | Explicit signed absolute synthetic caps recommended after separate authorization; defer keeps admission closed; subscription percentage without telemetry is not enforceable evidence |
| Registry metadata query | Explicitly approve production dependency names/versions to https://registry.npmjs.org/ for pnpm audit, or retain UNKNOWN vulnerability status. Automatic approval review rejected the exact egress; this decision is required to unblock it |

No option is silently selected. G02A stays NOT_AUTHORIZED and no implementation plan is activated. Next safe step: user resolves the blocked metadata-egress decision; separately assigned reviewer verifies this current-tree packet, source call chains, failed test and the effective infrastructure/provider authority gaps. Production stays BLOCKED and SECURITY_PASS remains unavailable.

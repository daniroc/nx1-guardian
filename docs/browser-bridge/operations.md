# Offline operations, evidence and activation blockers

Result: PARTIAL_IMPLEMENTATION / LIVE_ACTIVATION_BLOCKED. Date: 2026-10-12. This iteration adds a standalone inspector and inactive design artifacts. It does not create the requested autonomous conversation, a restricted Codex session, an installed extension or an authenticated service. No Core policy or NX1 contract is changed. Existing FIX-02 re-audit remains pending.

## What can run now

Use the repository's existing pnpm run typecheck, pnpm run lint, pnpm run build and pnpm test. Results: 69 tests/69 pass, zero fail/cancel/skip/todo; original 55 cases retained byte-for-byte, 14 new offline cases. Both directions, four inspection outcomes, Unicode/control detection, explicit normalization review, message limits, hash distinction, untrusted control metadata and absence of dispatch authority are exercised. Tests never call a real browser, model, service provider or external executor.

src/bridge-inspection.ts is deliberately not exported through the existing Core index. It is a draft pure data component with no listener, network, filesystem, credential, DOM or shell capability. inspectBridgeText accepts a closed direction/text object. Direction is a data label, not origin authentication. Configurable offline caps are bounded to hard ceilings. Oversized inputs are rejected before hashing; their originalHash is null, so no full original-byte audit guarantee is claimed for rejected oversized messages.

Within the bound, originalHash commits exact UTF16LE string code units, distinguishing malformed surrogate data without UTF8 replacement collisions. normalizedHash commits the UTF8 NFC candidate. These encodings are explicit and different; neither hash is an actual transmitted-byte record because no transmission occurs. No original/candidate transcript is persisted. Independently protected original/transmission logs, credential exclusion and privacy/retention approval remain future gates.

NFC changes return SANITIZE with requiresHumanApproval=true; suspicious invisible/bidi layout text returns REQUIRE_HUMAN_APPROVAL without deletion. Musical, mathematical, multilingual and variation-selector content is retained. NFKC, confusable folding and invisible stripping are absent. Hard control sequences, malformed scalars and bidi embedding/override controls return BLOCK. Findings are bounded without truncating the scan, so a late hard control still blocks. This is not comprehensive Unicode spoofing detection, a secret detector or semantic prompt-injection defense.

Every result has dispatchAuthorized=false. requireBridgeDispatchCapability always denies; there is no enable flag or administrative bypass. This preserves the existing fixture-only Core instead of laundering a browser message through fixture.read. No live sender, retry/resume, completion inference or extension cookie API is introduced. ui-sketch.html is static, has no scripts or connections and disabled initiation; it is not the real Guardian Web UI.

## Required next actions and verification

| External prerequisite | Required owner/action | Expected evidence |
|---|---|---|
| Close FIX-02 gate | Independent reviewer challenges R01/R02 and F01-F04 at verified HEAD | Recorded test/probe findings and explicit disposition, not implementation self-approval |
| Permitted browser route | Account owner establishes applicable agreement and supported integration/permission | Current official capability/contract; no assumed exemption or anti-detection workaround |
| Two Hyper-V VMs | Independent administrator provisions Guardian and Executor with least privilege | VM identities, boot/config hashes, no shared profile/mount/clipboard/debug sockets and project isolation |
| Network/OS confinement | Administrator installs deny-all egress and process/ACL controls | Actual deny probes for Executor-to-ChatGPT, desktop, secrets, arbitrary shell and cross-project files |
| Core message capabilities | External policy admin approves separately reviewed contract/identity/budget extension | Versioned signed policy/grants and replay/order/expiry tests; no agent policy updates |
| Immutable audit and STOP | External owners provision independent sink/witness and durable kill | Partition/crash/cancel/quarantine/restart tests with observed irreversible effects and accurate statuses |
| Real bridge/extension | Reviewed scoped release using supported lifecycle interfaces | Correlated conversation and verified completed response, auth/UI-change stops, no cookies in logs |
| Read-only demo | Independently isolated acceptance test after all gates | One instruction, bounded audit plus clarification, both-way inspection, non-bypass and safe STOP |

Cancellation, emergency STOP, session expiration, replay/order, authentic origin, browser isolation, protected audit and network bypass are NOT real-browser/VM-tested here. Existing synthetic core tests cover some analogous local properties; they do not close these gates. The extension/disconnection/UI-change completion contract is designed only. Tokens/spend/session quota remain unmeasurable for this web route without provider controls; use conservative proxy limits plus provider-side settings only where independently verified.

## Progress accounting

The requested percentages are evidence/checklist metrics, not guessed engineering effort:

| Iteration deliverable milestone (equal weight) | Completed |
|---|---|
| Baseline/dependency/threat analysis before implementation | Yes |
| Offline inspector with both-way/Unicode unit tests | Yes |
| Architecture, inert UI sketch and operational/blocker instructions | Yes |
| Authenticated mandatory Core messaging service and limits | No |
| Isolated extension with verified real ChatGPT lifecycle | No |
| Verified two-VM/OS/network/admin/audit/STOP enforcement | No |
| Independent audit evidence closing required gates | No |
| Autonomous read-only live demonstration | No |

Iteration checklist completion: **3/8 = 37.5%**. Overall autonomous acceptance readiness: **0/4 = 0%**, measured against (1) one instruction without manual forwarding, (2) inspection of every real message in both directions, (3) demonstrated inability to bypass Guardian, (4) safe real-system stop on security failure. This is not a percentage of all Guardian engineering completed. Existing unit evidence is useful preparation but does not establish any of those four live conditions.

No external independent reviewer was invoked in this iteration; current evidence is same-assistant local verification, not independent attestation. New evidence.json records hashes/tests and explicit limitations. Existing historical evidence is unchanged. Next recommended iteration: focused FIX-02 re-audit and permitted-route/VM readiness decision; continue offline preparation only while those gates remain open.

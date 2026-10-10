# G01 open risks and G02 readiness

Status: DESIGN_COMPLETE_PENDING_IMPLEMENTATION. Readiness: DESIGN_REVIEW_READY; G02_EXECUTION_BLOCKED_PENDING_EXTERNAL_PREREQUISITES. No deployment, active policy modification, autonomous communication, package implementation or production credential access was performed. This documentation does not authorize G02 execution.

## Critical unresolved dependencies

| Risk | Owner outside agents / closure evidence | Current state |
| --- | --- | --- |
| R01 no established independently hosted Guardian, admin identity roots or dual-review workflow | User-controlled security administrator: independent account/host, identities and access review; A01–A05/A10 | BLOCKING protected execution |
| R02 current agent tools/credentials may offer alternate paths; repository inspection cannot attest their removal | Host/account administrator: inventory and revoke direct writes/deployments/production secrets; confinement evidence A09/A15 | BLOCKING; no runtime confinement claim |
| R03 kill, durable ledger/fencing and executor isolation are designs only | External operator: real restart/partition/host-level tests A07–A11/A14/A17, measured latency and provider limitations | BLOCKING |
| R04 actual shared five-hour model quota and account telemetry/caps are not established | Account owner/provider: reliable scope/denominator/feed or explicitly accepted conservative proxies and provider controls; A12/A13 | BLOCKING exact-quota guarantees; no numerical percentage supplied |
| R05 independent immutable audit storage, witness and retention privacy approvals absent | Security/storage/privacy administrators: locked retention, independent checkpoint verification and recovery drill A16/A17 | BLOCKING production assurance |
| R06 provider scope/conditional writes/revocation/idempotency/cancellation semantics unspecified | External integration owner: exact capability evidence and fake-provider/real non-production integration results A08/A09/A11/A14 | BLOCKING writes/deployments; G02 excludes them |
| R07 service/release supply chain and cryptographic compliance unselected | External maintainer/security reviewer: pinned builds, vetted JCS/signature implementation, runtime support validation and A18 | BLOCKING activation |
| R08 policy limits/prices/session registry and data classification not externally approved | User/admin: signed values, aggregate hierarchy, fee upper bounds, allowed repositories/refs, privacy retention; A08/A12/A13 | BLOCKING paid or protected operations |

Baseline ambiguities: Core manifest uses private=false while README describes a private workspace package; do not infer publishing authorization. Existing dist artifacts passed five version tests and nineteen protocol tests without rebuilding; complete source/dist parity and broader security test outcomes remain unverified. No separate NX1 remote repository was required or inspected; Nexus supplied the real local NX1 baseline. Existing app contracts may have deployment gaps (provider README explicitly leaves DNS to network policy); none is proof of Guardian controls. Existing modifications were preserved; this is not a clean-tree security audit. Whole-tree whitespace checking found a pre-existing extra blank line in `Analisis`; G01 leaves it untouched. No installed service or external IAM posture was verified.

## Residual risks after proposed controls

Even a correctly implemented Guardian cannot guarantee benign decisions, prompt-injection immunity, semantic safety of an allowed patch, correct provider billing, exact opaque account quota, cancellation of requests already accepted, rollback of irreversible effects, or confidentiality after approved model disclosure. A compromised executor can abuse its allowed operation/credential until fencing; coarse provider rights require a mandatory narrow gateway. Host/hypervisor flaws, trusted-admin or signing-key compromise, approved malicious service binaries, gateway compromise and storage/witness collusion can defeat the trust assumptions. Rate limits reduce runaway/flood impact but do not eliminate denial of service. Conservative reservations may strand budget/slots and reduce availability. False denial and external approval latency are deliberate costs of default deny.

These are explicit limits, not requests for emergency bypass. If an external integration cannot provide necessary guarantees, disable its capability or restrict it to read-only/fake-provider execution. Never silently weaken policy to achieve availability.

## Proposed G02 scope

After external design review and explicit authorization, implement the reusable contract package and independent deterministic service in externally controlled development infrastructure. Create authenticated ingress, policy signature/currentness checks, typed non-production allowlist, strongly consistent operation/budget ledger, audit outbox/independent storage, mandatory operation gateway and VM supervisor. Use malicious-agent stubs and fake repository/model providers first, then approved non-production read-only integration. Use pnpm, frozen dependency locks, external reviewed releases and supported APIs. Do not add production credentials, autonomous conversations, GitHub writes, merge/deploy capabilities or policy administration to either agent.

## Acceptance criteria and gates

1. External reviewers approve all T01–T16 mitigation/test mappings and accept explicit residual limits; critical control gaps have owners and closure evidence. Design completeness alone is not authorization to start implementation.
2. R01–R03/R05/R07 close for isolated fake-provider service testing. R04/R08 must supply enforceable proxy budgets even for tests; exact-quota mode stays disabled without reliable provider evidence. R06 closes before any real provider capability. No production write or deployment scope in G02.
3. Both agents and broker cannot administer policy, issue grants, expand scope, unlock, increase budget or obtain production credentials. Actual environment/identity evidence demonstrates no alternative execution path.
4. A01–A18 and parser/state/budget invariants run with external effect/usage observers. Record expected denial reasons and containment evidence; all applicable critical cases must pass independently. Missing controls remain NOT_IMPLEMENTED or NOT_TESTED, never PASS.
5. Compatibility tests preserve NX1 1.3 and legacy stored-input semantics; strict outer security boundary does not change Core RFCs, existing policy or fixtures. Human preview and DEL confirmation remain required.
6. Emergency drills persist lockout across crashes/restores, revoke/terminate with measured latency, report in-flight uncertainty truthfully and require external dual approval for unlock. Ambiguous effects never auto-retry/refund.
7. Concurrent aggregate-budget reservations cannot exceed externally approved cap assumptions. Provider telemetry limitations, fees and cancellation latency are documented; opaque model quota has no exact guarantee. Telemetry loss fails conservatively.
8. Independent audit verification detects edits, deletion and rollback; privacy/retention access controls and incident recovery are exercised. A service outage fails closed without disabling kill control.
9. External security reviewer accepts reproducible release artifacts, dependency/runtime support, integration capability evidence and unresolved residual risks before any later production phase. A verified G02 test result would be limited to the tested deployment/profile; it would not prove universal security.

## G01 completion decision

Five requested documents define architecture diagram, trust-boundary and permission matrices, policy state machine, threat/control/test traceability, residual risks and G02 criteria. Result is DESIGN_COMPLETE_PENDING_IMPLEMENTATION, subject to human design review. BLOCKED_MISSING_BASELINE does not apply because actual NX1 packages were available. SECURITY_PASS is forbidden for this design-only result. The unresolved critical items block protected operation/production readiness, not completion of G01 documentation.

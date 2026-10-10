# G01 Guardian threat model

Status: DESIGN_COMPLETE_PENDING_IMPLEMENTATION. Date: 2026-10-09. No Guardian control is implemented or certified by this document. This is a proposed NX1 security profile, not an amendment to NX1 Core or an active policy. Companion documents: [architecture](G01-architecture.md), [policy contract](G01-policy-contract.md), [test plan](G01-adversarial-test-plan.md), [open risks and G02 gates](G01-open-risks.md).

## Objective and baseline

Protect authorized operations and bounded resources even if ChatGPT, Codex, or both produce malicious content. Agent consensus, confidence, formatting, and claims of human approval confer no authority. Deterministic authorization evaluates typed operations against externally approved policy and verified identities; it does not attempt to determine whether prose is safe.

Actual baseline: local Nexus working tree at HEAD `44ea6fee49fa13d3a10b8081b71c7f368480972d`, inspected on 2026-10-09 Europe/Madrid. This is a reference repository containing NX1 packages, not evidence of a separately deployed NX1 repository or Guardian service. The tree has pre-existing tracked and untracked changes, including `package.json` and application code. Evidence below describes inspected working-tree files, not a clean release attestation. No remote repository lookup or credentials were used.

| Evidence | Observed fact | Guardian implication |
| --- | --- | --- |
| `packages/nx1-core/src/index.ts`; package RFC-NX1, Grammar, Rules and TestSuite | Canonical output 1.3; legacy input 1.1; unknown blocks/fields preserved or ignored; PROP is a proposal; preview does not mutate | Retain Core behavior; strict security envelope is a separate profile boundary |
| `packages/nx1-core/package.json`; README | ESM TypeScript, dist import/types exports, sideEffects false, Node >=24 <27 and pnpm >=10; manifest private=false while README calls it a private workspace package | Follow package structure as a proposal; publication posture needs external resolution |
| `pnpm-workspace.yaml`; root `package.json`; `scripts/enforce-pnpm.mjs` | packages/* and apps/* workspaces; pnpm@10.28.1; installation guard requires pnpm | No npm migration needed for inspected root/Core; no install or manifest changes in G01 |
| `docs/releases/nx1-core-v1.3.md`; `docs/nx1-core-playbook.md`; profile validation checklist | Methodology is product-independent; profiles add domain governance | Independent Guardian profile/service, not Nexus policy authority replacement |
| `src/lib/nx1.ts`; `packages/nx1-version-contract.test.mjs`; `tests/nx1-protocol.test.mts`; Core fixtures | Nexus re-exports Core; tests cover versions, escaping, preview, unknown-field compatibility, fixture validity | Preserve compatibility and add Guardian-specific denial tests later |
| `packages/nexus-ai-proposal-acceptance/README.md` and `packages/nexus-ai-proposal-acceptance/src/index.ts` | Acceptance binds project, revisions, proposal, provider evidence and actor; selected drafts are distinct from repository writes | Reuse binding concepts, never infer external authorization from draft acceptance |
| `packages/nexus-ai-provider-runtime/README.md` | Server-owned provider configuration, bounded transport and immutable run evidence are described; token counts are provider-reported; ambiguous billing acknowledged | Useful baseline concepts; README is not proof of deployed enforcement |
| `src/lib/server/auth/authorization-mutation-contract.ts`; `tests/authorization-mutation-atomic.test.mts`; `tests/authorization-mutation-b4.test.mts` | Closed request fields, canonical digests, atomic/fencing/recovery test scenarios | Design durable admission and ambiguous-outcome recovery separately |
| `packages/nx1-browser-evidence-agent/src/contract.ts`, `egress.ts`; `tests/website-native-evidence-bridge.test.mts` | Narrow capability, exact shapes, TTL, frame size, ephemeral proxy and paired targets; tests include replay and cleanup | Browser-specific confinement is not complete Guardian executor isolation |
| `packages/nx1-chronicle/src/index.ts` | Entry hash includes message/metadata; file store writes whole serialized entries using writeFile | Neither independent immutable storage nor deletion/truncation protection is established |

Executed baseline checks: `node --test packages/nx1-version-contract.test.mjs`: 5 passed, 0 failed; `node --experimental-strip-types --test tests/nx1-protocol.test.mts`: 19 passed, 0 failed. They consume existing generated Core dist artifacts (the latter through the Nexus re-export). Other listed tests were inspected, not executed; full source/build parity and application security are not certified. G01 adds only the five documentation files.

## Assets and adversary

Assets: administrative identities and keys; policy versions and lockout epoch; repository/branch identity and contents; execution grants; secrets; budget reservations; operation ledger; immutable audit checkpoints; user data and incident evidence. Assume attacker controls either agent, both agents, arbitrary repository files, tool output, logs, web pages, generated patches and an executor workload. Assume attacker can resend, reorder and race requests, steal an agent session credential, and make arbitrary claims inside valid NX1. Treat the broker as unable to grant authorization even if compromised.

Trusted computing base: external admin identity provider, Guardian binary and policy verifier, strongly consistent ledger, credential/operation gateway, secrets manager, isolation host/hypervisor, quota gateway, and independent audit storage/checkpoint verifier. Compromise of these dependencies is a residual risk, not solved by assuming trusted agents.

## Threat-to-control-to-test traceability

All rows are design obligations. Test IDs resolve in the [test plan](G01-adversarial-test-plan.md). Critical threats have explicit mitigation proposals and verifiable tests; implementation evidence is absent.

| ID / threat / severity | Required control | Test | Residual limit |
| --- | --- | --- | --- |
| T01 malicious Codex / critical | C01 no agent admin capability; C02 typed default-deny admission | A01 | Allowed harmful content may remain |
| T02 malicious ChatGPT / critical | C01 equal agent distrust; externally authenticated human review | A02 | Human may approve a bad operation |
| T03 agent collusion and bypass / critical | C01 neither agreement nor two agent signatures creates a grant | A03 | Compromised trusted admin is out of boundary |
| T04 forged NX1/user approval / critical | C03 authenticated envelope, actor binding, separate admin audience | A04, A05 | Agent identity theft enables its existing narrow request scope |
| T05 injection in files/logs/web / critical | C02 all content tainted; no instruction-driven authority; safe review rendering | A06 | Cannot guarantee agent cognition or output quality |
| T06 replay and duplicate execution / critical | C04 durable nonce/operation ledger, stable intent digest and provider reconciliation | A07, A14 | No generic exactly-once external effect guarantee |
| T07 confused deputy / critical | C02 actor/project/repository/branch/head/scope binding at use, exact adapter mapping | A08 | Provider authorization granularity may be coarser |
| T08 credential theft / critical | C05 executor-only ephemeral credential, narrow operation gateway, no secret in content | A09 | Malicious executor can misuse any direct credential during its lifetime |
| T09 policy downgrade / critical | C01 signed policy and externally approved activation; monotonic epoch | A10 | Trusted signing/admin compromise remains |
| T10 emergency override / critical | C06 independent kill switch, durable lockout, no message unlock | A11 | Already committed effects cannot be recalled |
| T11 runaway loops / high | C07 aggregate iteration/tool/time/concurrency reservations and per-principal ingress rate limits | A12 | Denied traffic still consumes finite control-plane resources |
| T12 quota exhaustion / critical | C07 conservative pre-reservation; provider-side controls; unknown usage held | A13 | Actual account/model quota may be unmeasurable |
| T13 compromised executor/network bypass / critical | C05 enforced host egress/filesystem isolation, gateway reauthorization and fencing | A09, A15 | Host/hypervisor vulnerabilities and allowed-channel exfiltration |
| T14 audit tampering / critical | C08 external retention-locked append-only log with witnessed checkpoints | A16 | Storage/witness collusion and privacy exposure |
| T15 outages/partitions/stale replicas / critical | C09 fail closed without authority, ledger, audit receipt or lease renewal | A17 | Availability loss, uncertain in-flight effects |
| T16 supply chain/service compromise / critical | C10 externally approved digest-pinned service/image builds and independent release review | A18 | Malicious approved binary or root administrator |

## Scope limits

No claim of preventing prompt injection itself, malicious but permitted edits, social engineering of a real administrator, provider overbilling, confidentiality of data legitimately sent to a model, physical compromise, host escape, or all denial of service. Guardian limits authority and execution, not semantic correctness. Existing unrestricted agent shell/tools or installed credentials violate this deployment model; documentation cannot remove those paths. Both agents must run in externally managed confined environments before protected execution is enabled.

# Browser route, host prerequisites and capability boundary

Assessment date 2026-10-13. Proposed no-API autonomous route: **UNVERIFIED**, activation BLOCKED. Technical feasibility is conditional; no stable or permitted third-party ChatGPT composer/response transport was established. No ChatGPT message, browser/profile inspection, extension installation or VM activation occurred.

## Current primary-source compatibility

[Official browser extension documentation](https://learn.chatgpt.com/docs/chrome-extension) describes desktop ChatGPT Work/Codex operating supported browsers, website permissions and broad extension debugger/data/native-app privileges. It establishes agent-to-website control, not a Guardian-owned ChatGPT completion protocol. [Site tools](https://learn.chatgpt.com/docs/webmcp) let websites expose tools; website tools/results remain untrusted and regular browser abilities can remain available. Offering Guardian tools alone cannot confine an agent.

[Computer Use documentation](https://learn.chatgpt.com/use-cases/use-your-computer-with-codex) describes macOS/Windows foreground workflows and no Windows locked use. It does not demonstrate the selected protected Linux-VM client/session workflow. Linux guest client, extension/native-host compatibility and supported completion/cancellation lifecycle all need exact tested releases; do not assume desktop availability proves these combinations.

[Europe Terms of Use](https://openai.com/policies/eu-terms-of-use/) retrieved on this date, page updated January 16, 2026, prohibit automated/programmatic extraction and bypass of protective restrictions. Residence, consumer/business agreement and any applicable written permission are unknown. The proposed response extractor therefore cannot be activated on assumed subscription permission. Account owner must obtain authoritative applicability/permission and supported integration evidence, or retain human-mediated/offline operation. No CAPTCHA, login, anti-automation, rate-limit bypass, cookie harvesting, private endpoint or OpenAI API fallback is proposed. This is a gate assessment, not a legal determination about an unverified account.

## Host measurements and prerequisites

[Microsoft Hyper-V requirements](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/host-hardware-requirements) specify supported Windows editions, SLAT, VM Monitor Mode, enabled firmware virtualization/DEP and enough RAM for host plus guests. Its 4 GB minimum is not a capacity plan for two working VMs. A detected hypervisor can obscure feature reporting.

Authorized read-only CIM/storage/firewall measurements returned:

| Property | Observation | Consequence |
|---|---|---|
| OS | Windows 11 Pro 64-bit, 10.0.26200/build 26200 | Edition prerequisite verified, patch/support posture not assessed |
| Visible RAM / free snapshot | 16,621,808 / 1,569,088 KiB, approximately 15.85 / 1.50 GiB | Insufficient current headroom for provisional two-guest allocation |
| C drive total / free | 1,023,079,870,464 / 108,877,398,016 bytes, approximately 952.82 / 101.40 GiB | Disk space measured, no guest allocation or durability verification |
| HypervisorPresent | true | Some hypervisor detected, not proof Guardian Hyper-V topology exists |
| Firmware virtualization / SLAT / VM Monitor flags | all false through current CIM view | Contradictory/possibly masked; firmware/hardware readiness NOT_VERIFIED, no claim physical support absent |
| Get-VM / vmms | no command/service result visible | Guest identities/topology NOT_VERIFIED |
| Hyper-V optional feature | query requires Windows elevation | NOT_VERIFIED; no activation or request to elevate host administration |
| Firewall profiles | Domain/Private/Public enabled; default actions 0 (NotConfigured) | No effective egress deny guarantee; rules, routes and bypass containment NOT_VERIFIED |

No serial numbers, account identities, network addresses, cookies, environment variables or secrets were collected. Host observations are a momentary snapshot, not VM integration tests. A provisional lab plan is 4 GiB Guardian + 4 GiB Executor + at least 4 GiB host reserve and two 32 GiB guest disks with growth reserve; this is an estimate requiring workload measurement, not a vendor minimum or allocation performed here. Browser/compilation pressure may require more memory/disk. External administrator must verify firmware/DEP, feature installation, compatible guest/client versions, capacity and boot configuration before provisioning separately authorized infrastructure.

## Enforceable target capabilities and bypass verification

Both agents remain untrusted. Independent administrator owns release roots, policies, guest controls, credentials, STOP and recovery. Neither agent receives host/guest administrator rights, Guardian process filesystem, Docker/Hyper-V sockets, shared clipboard/profile/mount or recovery keys. Guardian broker/UI validates origin/session, authenticated actor, envelope, policy/grant and audit readiness server-side; direction fields and button clicks cannot supply authority.

| Capability / attack | Required technical boundary | Future negative test / evidence |
|---|---|---|
| Nexus repository and approved development tools | Executor-specific project copy/ACL; non-root account, reviewed command gateway and resource limits; no other project or host mounts | Read/write outside assigned copy, symlink traversal and cross-project access denied; approved build works |
| Guardian UI | Restricted browser session/origin through externally enforced proxy; server actor binding and signed reservations | Foreign origin, forged approval, direct endpoint and stale/replayed grants denied with audit |
| Direct ChatGPT, alternate browsers and CLI HTTP | Guest egress default deny outside mandatory authenticated proxy; protected browser in separate Guardian VM; controlled resolver, no arbitrary CONNECT | Browser/curl/Node/proxy/raw IP/IPv6/DoH/QUIC/alternate-port routes denied by external observer |
| Codex provider connectivity | Exact supported provider transport allowlist separate from UI route; mandatory proxy mediation | Its required model connection works while arbitrary ChatGPT endpoints/content routes fail. Shared host/domain endpoints may make domain-only filtering insufficient; resolve transport compatibility before activation |
| Process spawning / desktop control | No desktop-control/native-messaging/remote-debug capability in Executor; command allowlist, privilege/process confinement and namespace/seccomp controls | Spawn alternate browser/CLI broker, debugger or unauthorized desktop control denied; no privileged sockets |
| Credentials | Synthetic identities initially; later secrets manager releases short-lived narrow credentials only to trusted executor/bridge, never agent | File/env/metadata/token theft and logs containing credentials denied/redacted; expiry/revocation observed |
| Repository/file/log/web injection and collusion | Treat all text as data; deterministic operation allowlist and authenticated human admin separation; no emergency/policy APIs exposed to agents | Injected approval, both-agent bypass request and valid forbidden NX1 envelope denied; no quota or policy promotion |
| Browser/extension compromise | Minimal reviewed permissions, isolated profile, trusted native channel, broker reauthorizes every send/return, no agent access to CDP/cookies | Forged extension events and unauthorized original/normalized substitution rejected. Compromised trusted browser may falsify origin/completion or leak through allowed endpoints: residual TCB risk requiring independent release/observability |
| Emergency and outage | External supervisor/durable lock, admission freeze, fencing, network/profile quarantine and externally authenticated recovery | Kill registry/audit/policy/telemetry outage denies admission; restart cannot erase lock; delayed/failed cancellation remains pending; irreversible effects recorded, never claimed undone |

Firewall settings inside an agent-administered guest are insufficient. Network enforcement must survive agent compromise and permit only approved protocol/content paths; domain lists alone do not close confused-deputy/proxy/shared-endpoint routes. Arbitrary production GitHub/deployment/secret connectors must be absent from the confined agent runtime. Current desktop tool inventory is outside Guardian; no existing permissions were revoked or changed. These negative cases are **specified, not executed**: no host/network escape or hostile process experiment occurred.

Invalid messages/expired signatures: deny before effect. Missing policy, ledger inconsistency or audit outage: deny and preserve UNKNOWN/reservations; no automatic refund/retry. Missing reliable usage telemetry: no paid/live model admission; artificial units only in lab. Failed emergency controls: STOP_UNCONFIRMED/STOP_DURABLE, independent quarantine/lock, no recovery inferred from tool text. Actual model subscription quota/cost cannot be bounded exactly by these synthetic counters; provider-side verified controls and conservative proxy limits are prerequisites. Browser disconnect/UI drift/auth expiry/ambiguous send: quarantine UNKNOWN, no resend or extraction guessed from DOM state.

## Decision paths and minimum next work

| Blocker / severity | Solution, owner, prerequisites and verification | Residual / blocks live |
|---|---|---|
| Fallback restart lock / P2 local, critical deployment implication | Explicit offline iteration: durable independently held stop intent, fail-closed restart and authenticated recovery; review crash/witness ordering; test P11 plus crash-between-stores | External host kill still required; yes |
| Browser route / high | Account owner verifies applicable terms/permission and vendor-supported composer/completion/cancel interface; compatibility evidence for exact VM client versions | UI/provider change and cancellation ambiguity; yes |
| Capacity/topology / high | Administrator verifies Hyper-V/firmware and frees/upgrades resources; separately authorize two guests, no host sharing; attest configuration | Same physical host/root compromise; yes |
| Direct-tool bypass / critical | Administrator provisions external egress/process/ACL confinement, inventories provider endpoint overlap, removes privileged connectors | Approved transport can be abused without content checks; yes |
| Core message authority / critical | Separate reviewed NX1 extension/policy, identity and replay/sequence/budget boundaries; no fixture.read laundering | Untrusted semantic content persists; yes |
| Independent admin/STOP/audit/TCB / critical | External MFA/dual approvals, durable supervisor, retention-locked audit/witness and signed reviewed release; custody and disaster recovery drills | Compromised trust roots, irreversible in-flight effects, power loss; yes |
| Real acceptance / high | After all gates and separate authorization, observe bounded read-only conversation, every message, no bypass, actual safe STOP | Cannot establish universal prompt-injection prevention; yes |

Smallest recommended next instruction: `GUARDIAN-G02A-0-FALLBACK-PERSISTENCE-01`, offline design-first/red-green characterization of P11 and crash/restart/recovery semantics, synthetic providers only; separately obtain supported-route/account clarification and independent infrastructure decisions. This is a recommendation, not authorization or an implementation started here. No automatic G02A-1 or production integration follows.

## Criteria-based progress

This audit iteration evaluates phases A-F: 6/6 assessments delivered = **100% assessment completion**, including documented blocked/unverified results; this does not mean its desired live outcome succeeded. Overall Guardian autonomous-delivery checklist uses the existing eight Bridge-01 milestones as an explicit limited roadmap: **3/8 = 37.5%** verified preparation. It is not an estimate of all engineering effort; no defensible universal project completion percentage exists without an agreed complete roadmap. Live autonomous acceptance uses the four unchanged conditions (one instruction/no forwarding; all real messages inspected both ways; demonstrated non-bypass; safe real-system STOP): **0/4 = 0%**. Existing lab controls are not counted as live acceptance.

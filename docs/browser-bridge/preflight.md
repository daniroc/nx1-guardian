# BROWSER-BRIDGE-01 pre-implementation audit

2026-10-12 Europe/Madrid. This analysis was written before new implementation. Baseline branch main, HEAD 369902a51a76d27c6faf1e6d2791cc3452f9417a, tree 62b75d42d708c572b3f8f2a7dcecb44b532e776d; clean checkout, 100 tracked files. origin/main matched HEAD through a read-only ls-remote check. FIX-02 source/evidence hashes and all 73 archived-history hashes matched. Existing contracts, policies, signatures, caps, tests and evidence remain authoritative and unchanged.

## Mandatory gates

| Gate | Evidence | Status |
|---|---|---|
| FIX-02 focused independent re-audit | docs/fix-02-evidence.json and risks.md explicitly require it | PENDING |
| Guardian/executor VM separation | Get-VM command unavailable; vmms service not visible through current queries | UNVERIFIED; not proof no VM exists |
| OS/process/filesystem/network enforcement | No deployed confinement, ingress/egress allowlists or guest attestation found | UNVERIFIED |
| Core message authority | Policy.operation only fixture.read; valid proposals exclude bridge operations; text profile is ASCII | UNSUPPORTED; no policy/schema downgrade allowed |
| Independent administration and audit | Synthetic identities, same-host witness and local fallback limitations | UNVERIFIED for activation |
| Browser compatibility and permitted use | No documented custom ChatGPT Web transport, stable completion contract or account approval found | UNVERIFIED/RESTRICTED |
| Browser session custody | No authenticated profile inspected, extension installed or cookie accessed | UNVERIFIED |
| Independent emergency kill | No external durable lock registry/provider revocation observer | UNVERIFIED |

Activation is denied. No agent-supplied boolean, approval text, extension event, DOM marker or model response can close these gates. Current Codex tools remain capable of direct shell/browser/provider access; this iteration cannot technically deny them with a text instruction. A real demonstration would fail the requested mandatory-boundary acceptance.

## Dependency decision

No runtime dependencies or new packages are introduced. Existing development graph stays typescript 5.9.3, @types/node 26.1.0, undici-types 8.3.0; pnpm lock SHA256 92b8278d7721ce824b3a5835e8c8787444d4ce627e94c7c87b461e8c643b7c48. Use Node crypto and Unicode normalization for a pure offline classifier. No Playwright/CDP, ChatGPT selectors, browser debugging port, websocket listener, cookie API, cloud API, shell adapter or installed extension is added. The existing experimental SQLite/runtime/types mismatch and provenance gaps remain.

Safe scope: architecture/threat/operational documents, offline four-outcome Unicode/content inspection, tests and an inert UI sketch. This classifier is data analysis, not Core authorization or an injection-proof semantic firewall. Its ALLOW can never authorize dispatch. Unicode remains outside the existing ASCII NX1 control profile: do not widen canonical() or relabel a browser send as fixture.read.

## Official-source compatibility review

Fetched 2026-10-12: [official extension documentation](https://learn.chatgpt.com/docs/chrome-extension), [site tools](https://learn.chatgpt.com/docs/webmcp), [Europe Terms of Use](https://openai.com/policies/eu-terms-of-use/) (updated January 16, 2026). Official browser support lets ChatGPT operate websites; it does not establish a supported third-party protocol for driving the ChatGPT composer and extracting its answers. WebMCP documentation concerns tools offered by a website, not a ChatGPT response-completion API. This is an inference about the absence of established support, not a claim no alternative permission can exist.

The current Europe consumer terms prohibit automated/programmatic extraction of data or output and bypass of rate limits/protective measures. Applicable residence/account agreement and any written permission are not verified. Do not infer an exemption from a subscription, installed extension or human request. This prevents activating the proposed extractor without authoritative clarification. No API fallback, CAPTCHA bypass, session-token harvesting, private endpoint reuse or anti-detection behavior is implemented. Official legal terms were fetched because the user explicitly requested applicable service restrictions; outdated search snippets were not treated as current policy.

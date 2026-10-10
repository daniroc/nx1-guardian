# G01-R2 minimal dependency vulnerability audit

**AUDIT_COMPLETED_WITH_FINDINGS** — 24 applicable advisory records affect 12 public package/version pairs. Advisory severities: 13 high, 8 moderate, 3 low, zero critical and zero informational. These are registry advisory counts, not a Guardian security verdict or a count of exploitable application vulnerabilities.

## Baseline and preservation

The locally verified, previously pinned Nexus baseline is HEAD `4fe297ad601e97d70589c42ef24ac9399cd951ac`, tree `a280aea5a5be754bc55bf843e99aa801073f5908`, in `guardian-g01-r2-current-main`. No remote-main refresh was attempted under the restricted network scope, so this report does not assert that remote main has remained unchanged.

Before and after the audit, repository status remained `?? docs/guardian/`. Existing review documents were preserved. Root manifest SHA256 remained `e0828282655f754a7acf40a063ce0f6f0b49ef1d8fcc497a6b5987b38ceaf08e`; lockfile SHA256 remained `3aeff1b09f55767254aa1db99690ce80e7b81bf93fbb23dad009f69996b3f67b`. No repository file, dependency, permission or Git state was modified. No installation, download, rebuild, lifecycle script, commit, push, merge, deployment or Guardian implementation occurred. The original Nexus workspace was not accessed or changed in this task.

## Documented endpoint and exact precheck

The locally installed npm documentation, `C:/Program Files/nodejs/node_modules/npm/docs/content/commands/npm-audit.md`, lines 103–119, documents the Bulk Advisory request as a JSON object mapping package names to lists of versions and POST path `/-/npm/v1/security/advisories/bulk`. The installed Arborist implementation at `lib/audit-report.js:334` corroborates that path and POST body. npm was neither executed nor used for installation. Reading its documentation establishes the request contract; it does not attest to package-manager supply-chain integrity.

Offline extraction used the existing lockfile and pnpm 10.28.1 local inventory with socket connections disabled. The existing bundled YAML parser was exported in memory without executing the pnpm CLI entry point. Exact version validation used the already installed semver implementation. Neither tool installation was edited.

The extractor excludes workspace names, known internal scopes, private packages, nonstandard/local/git sources, unresolved references and entries without exact local public-registry provenance. Public-source evidence was checked against existing pnpm inventory resolution URLs and available local package manifests. The configured non-npm `@jsr` registry was not contacted and no matching entries were included. Public-source classification relies on local provenance, not independent publisher attestation.

- Body: **328 public package names; 356 deduplicated exact name/version pairs**, covering all 356 external package entries in this lockfile, including optional platform variants and development dependencies. Internal workspace links were not part of this external package table and were excluded.
- Destination: `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`.
- Exact serialized body: **10,640 bytes**; SHA256 `695af91d76516cfcaf407983553ace401840fd330c9f6e890223155e23abc903`.
- Transmitted body categories: **public npm package names and exact public versions only**.
- The body contained no source, private workspace names, internal paths, repository identifiers, graph edges, integrity hashes, secrets, credentials or unrelated fields.
- HTTPS headers: standard Host/Content-Length/Connection plus JSON Content-Type, JSON Accept and identity Accept-Encoding. No authorization, cookies or repository metadata headers. Normal DNS/TLS transport necessarily exposes connection information to the registry/network.
- TLS certificate validation enabled; no proxy configured by the script; no redirect, alternate registry, fallback audit endpoint, package retrieval or automatic retry. Whole-request limit 30 seconds; response limit 8 MiB.

The exact serialized payload was inspected before transmission. The transport revalidated its schema and SHA256 before sending it.

## Transport and response handling

**Two identical minimal POST requests were sent; both returned HTTP 200.** The first response lacked Content-Type and was discarded by the initial conservative validator. The validator was adjusted to accept absent Content-Type only subject to bounded JSON validation; the second returned a 7,596-byte body, saved locally. No subsequent network calls were made.

The saved response SHA256 is `219787ac867bafa50a3337b382b0efdb0c6cb3893248f0a1d1f9e4bf8eb4f5d3`. Individual advisory records omitted the `name` field listed in the local documentation. The initial validator rejected that shape. Offline revalidation accepted the name from the enclosing, already-requested package key and requires any explicit name to match. Advisory fields, severity, URLs and semver ranges were validated, and each affected version was matched locally against its returned vulnerable range. Both initial validation failures remain recorded in the transport evidence; they were not silently overwritten as successful validations.

No advisory URLs were fetched. No additional package metadata was requested to calculate remediation or meta-vulnerabilities.

## Affected packages and conditional remediation

“Direct” means declared by at least one workspace importer. It can also be transitive elsewhere. “Transitive” below means no observed direct declaration. All 12 affected pairs have some observed production/optional dependency reachability; that does not prove inclusion in a deployed bundle or runtime exploitability. Of all 356 audited pairs, 9 were observed only through development paths; none of those 9 received an applicable advisory. Build dependencies can still affect production artifacts and privileged build execution.

The candidate constraints below are derived solely from the returned vulnerable ranges. They do **not** establish release availability, maintenance status, compatibility, complete remediation or supply-chain safety. No updates were made.

| Public package | Locked version | Class | Advisory count / maximum severity | Candidate outside the reported ranges |
|---|---|---|---|---|
| @grpc/grpc-js | 1.9.16 | Transitive | 2 / high | >=1.13.6 |
| @sveltejs/kit | 2.69.1 | Direct; manifest/build and potential runtime roles | 1 / moderate | >2.70.1 |
| @tiptap/core | 3.27.1 | Direct | 2 / high | >=3.30.5 |
| brace-expansion | 5.0.9 | Transitive | 3 / high | >=5.0.12 |
| cookie | 0.6.0 | Transitive | 1 / low | >=0.7.0 |
| devalue | 5.8.1 | Transitive | 7 / high | >5.9.2 |
| nanoid | 3.3.15 | Transitive | 2 / high | >=3.3.18 |
| postcss | 8.5.16 | Direct and transitive | 2 / high | >8.5.22 |
| prosemirror-view | 1.42.0 | Transitive | 1 / high | >=1.42.3 |
| protobufjs | 7.6.4 | Transitive | 1 / moderate | >7.6.4 within a compatible maintained release |
| sharp | 0.35.4 | Direct optional codec | 1 / high | >=0.35.5 |
| source-map-js | 1.2.1 | Transitive | 1 / high | >=1.2.2 |

Prioritize request-facing serialization, editor/paste handling and parsers of untrusted content. Upgrade parent dependencies through pnpm in a separately authorized remediation task, rather than assuming a transitive override is compatible. Require focused regressions for affected entry points and offline/adversarial checks before claiming remediation.

## Exploitability and Guardian impact

- **SvelteKit/devalue/cookie:** request negotiation and serialization/session boundaries are plausible application security surfaces. SvelteKit's advisory concerns unauthenticated Accept-header CPU denial of service. The devalue advisories cover malformed data, shared-memory serialization, sparse arrays, string expansion, async rejection and prototype-key handling. Whether each affected API receives attacker-controlled values must be traced; version matching alone does not establish exploitability. Cookie exploitation depends on attacker control of emitted cookie name/path/domain values.
- **Tiptap/ProseMirror:** source evidence includes runtime editor imports at `src/lib/components/Editor.svelte:3`, `RichTextField.svelte:5`, ProseMirror view use at `RichTextField.svelte:21`, and `mergeAttributes` use at `src/lib/tiptap/carousel.ts:1`. The returned advisories concern attributes/prototype behavior, Markdown parsing and paste XSS. These imports warrant targeted review but do not prove the vulnerable Markdown parser or attacker-controlled attributes are reachable. Editor/browser compromise matters where that browser holds administrative sessions; it must not grant independent Guardian policy authority.
- **Sharp:** `packages/nx1-image/src/sharp.ts:6` imports the optional native codec; server image processing and storage paths import this boundary. The returned advisory concerns librsvg memory safety. Existing header checks, supported image types, pixel/channel limits, a decode budget and five-second codec limits reduce some exposure. They do not establish native-code safety. SVG reachability and the actual platform codec/libvips configuration remain unverified; accepted formats appear restricted to JPEG/PNG/WebP/GIF in this entry point. A malformed native image path must stay outside Guardian's trusted service.
- **grpc-js/protobufjs:** transitive cloud-related dependency paths deserve credential-boundary review. grpc-js advisories concern particular certificate-authentication configurations and handler error disclosure. The protobuf advisory concerns `.proto` option parsing. This audit does not demonstrate a grpc server, affected getAuthContext configuration, or attacker-supplied `.proto` input in Nexus. Do not equate presence with confirmed exploitation.
- **PostCSS/source-map-js/brace-expansion/nanoid:** potential build/parser/file-disclosure and denial-of-service surfaces. Exploitation depends on untrusted CSS/source maps, brace patterns or invalid sizes reaching the specified functions. No complete call graph, deployment trace or exploit execution was performed. Isolate any future untrusted build executor from policy, credentials and other projects.

These findings concern Nexus and its candidate security-relevant dependencies. A separately hosted Guardian must select and audit its own minimal dependency closure, build pipeline and runtime. Nexus browser, image, editor and cloud SDK dependencies must not automatically enter Guardian's trusted computing base. Provider identity, independent administration, capability bypass, isolation, emergency shutdown and immutable audit-storage blockers from G01-R2 remain separate and unresolved. G02A and production integration remain unauthorized.

## Advisory evidence

The registry returned these IDs; links are references from the received response, not separately fetched evidence:

- grpc-js: [GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [GHSA-f596-whhp-79r4](https://github.com/advisories/GHSA-f596-whhp-79r4).
- SvelteKit: [GHSA-29g2-3rmr-qm68](https://github.com/advisories/GHSA-29g2-3rmr-qm68).
- Tiptap: [GHSA-cp6q-959q-f8rh](https://github.com/advisories/GHSA-cp6q-959q-f8rh), [GHSA-j95f-988m-3j2f](https://github.com/advisories/GHSA-j95f-988m-3j2f).
- brace-expansion: [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7), [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p), [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr).
- cookie: [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x).
- devalue: [GHSA-9rgm-9g3h-6x36](https://github.com/advisories/GHSA-9rgm-9g3h-6x36), [GHSA-j22f-vq7h-c4qm](https://github.com/advisories/GHSA-j22f-vq7h-c4qm), [GHSA-hx4r-w6wj-j8fg](https://github.com/advisories/GHSA-hx4r-w6wj-j8fg), [GHSA-mcm9-63f2-9j32](https://github.com/advisories/GHSA-mcm9-63f2-9j32), [GHSA-wf3x-273g-mvxv](https://github.com/advisories/GHSA-wf3x-273g-mvxv), [GHSA-x5rw-q4pp-hg5g](https://github.com/advisories/GHSA-x5rw-q4pp-hg5g), [GHSA-4q55-j62x-fr9h](https://github.com/advisories/GHSA-4q55-j62x-fr9h).
- nanoid: [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8).
- PostCSS: [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849).
- ProseMirror: [GHSA-c8x8-7fp4-3x9w](https://github.com/advisories/GHSA-c8x8-7fp4-3x9w).
- protobufjs: [GHSA-j3f2-48v5-ccww](https://github.com/advisories/GHSA-j3f2-48v5-ccww).
- sharp: [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w).
- source-map-js: [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

## Limits and local artifacts

This bulk query does not calculate full npm meta-vulnerability chains or an automatic upgrade solution, attest to publisher identities, verify package bytes, detect malicious releases or unknown vulnerabilities, audit private workspace implementation, or prove deployed dependency composition. Registry advisory text and local dependency tooling are untrusted evidence. No security control or remediation was tested. The absence of returned advisories for a package is not evidence that it is safe.

Only new audit artifacts were written in the external visualization root: offline-list script and local graph, preparation script, minimal payload, precheck, local classification, transport script, first and second transport evidence, raw advisory response, offline analysis script/results and this report. Local graph/classification artifacts contain internal provenance and must not be uploaded; only the inspected minimal payload was transmitted. The earlier blocked-audit evidence remains intact.

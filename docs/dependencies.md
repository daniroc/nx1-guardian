# Independently scoped dependency record

Guardian has **no runtime npm dependencies**. Its exact development closure is three packages; none of Nexus's cloud/browser/editor/image dependencies is inherited. Installed using `pnpm install --offline --ignore-scripts`: reused 3, downloaded 0, no lifecycle scripts. Lockfile SHA256: `92b8278d7721ce824b3a5835e8c8787444d4ce627e94c7c87b461e8c643b7c48`.

| Package | Version / role | Lockfile integrity |
|---|---|---|
| typescript | 5.9.3 / direct development compiler | sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw== |
| @types/node | 26.1.0 / direct development declarations | sha512-O0A1G3xPGy4w7AgQdAQYUlQ+BKk2Oovw8eRpofyp5KdBZULnbe+WqaOVNrm705SHphCiG4XHsACrSmPu1f+Kgw== |
| undici-types | 8.3.0 / transitive development declarations | sha512-j375ScV60dom+YkPFIfTLcOiPxkN/buHz5GobjLhixFuANaNs3C9l4GmrWqejgXWJ7BbJcFYpTEUkS1Ge8bpZQ== |

Provenance: exact versions resolved from existing local pnpm public-registry cache and bound by the new standalone lockfile. Registry origin is the normal public npm registry; no new registry audit or package download was done for this iteration. These exact public pairs appear in the previous minimal registry request and received no applicable advisory records in that saved response. That is historical advisory evidence, not a fresh Guardian supply-chain audit or proof of safety. Lock integrity is not publisher authenticity or independent verification of installed package bytes. Types from Node 26 compile the restricted API subset executed under Node 24; release validation must select a supported matching declaration/runtime policy.

Actual tested runtime: Node v24.21.0, V8 13.6.233.17-node.53, OpenSSL 3.5.8, SQLite 3.53.4; pnpm 10.28.1. Native SQLite is an experimental built-in in this runtime. These platform/compiler/cache/tooling components are part of the lab's trusted computing base and were not independently supply-chain certified. Pinning versions and using built-ins reduces the npm graph but does not eliminate TCB risks.

Nexus's 24 applicable advisories across 12 public packages remain documented in the earlier audit. They do not automatically apply to Guardian. Reassess Guardian's own runtime/build closure, binary provenance and security advisories before any externally approved release. No publish/install/update lifecycle hook or remote CI workflow was added.

# NX1 Guardian credential-free laboratory

G02A-0 local prototype: strict NX1 **1.3**, deterministic authorization, synthetic Ed25519 identities, default denial, transactional synthetic accounting, durable emergency fencing, replay protection and a fixed inert provider. **FIX-02: 55 local tests pass (48 preserved plus 7 R01/R02 cases). Focused independent re-audit is required; G02A-0 closure, G02A-1 and production remain blocked.** Nothing is deployed; no policy is activated outside synthetic fixtures.

The standalone repository is `daniroc/nx1-guardian`. It was publicly readable and empty when cloned; local HEAD is unborn `main`. GitHub repository metadata reports pull/push rights; a separate collaborator-permission endpoint returned 403. No remote write was attempted to prove permissions, and none is authorized. There are no imports of Nexus packages or privileged composition modules.

Run from this checkout with Node **24.21.0** and pnpm **10.28.1**:

```sh
pnpm install --offline --frozen-lockfile --ignore-scripts
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm test
```

The offline install requires the three development artifacts already present in the cache; it must fail rather than silently fetch them. Runtime npm dependencies: **zero**. The actual runtime includes Node/V8/OpenSSL/SQLite, which remain trusted dependencies. `node:sqlite` is experimental in the tested runtime; this choice is limited to the lab pending independent review. No deprecated API is intentionally used.

Tests are trusted inert fixtures, not hostile workloads. They use a restricted single-process Node test runner, filesystem writes limited to `.lab-tests`, no subprocess permission, a static no-network/no-execution capability lint and a fixed provider. Node permissions are defense in depth, **not a VM, a network firewall, or proof that native SQLite respects all JavaScript filesystem restrictions**. Signing keys are generated synthetically in memory and are never production credentials. Fixtures are retained locally for inspection, ignored by Git, and not automatically cleaned up.

The reusable typed API is exported from `src/index.ts`; `build` emits declarations and ESM under `dist/src`. It is private and not published. Trusted harness composition supplies identity roots, signed bootstrap policy, two distinct external administrator identities, clock, ledger and witness. Agents receive proposal/grant-use channels only; callers must not expose the trusted constructor, database or witness adapter to them. This library is not a running remotely administered service.

See [architecture](docs/architecture.md), [contract profile](docs/contracts.md), [threat/control/test matrix](docs/traceability.md), [dependency provenance](docs/dependencies.md), [residual risks and G02A-1 prerequisites](docs/risks.md), and [validation evidence](docs/validation.md).

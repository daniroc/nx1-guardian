# Browser bridge threat and dependency boundaries

Both agents, repository/log/web text, model output and extension events are untrusted. Guardian and its externally owned administrator/witness remain separate authorities; compromise of that trusted computing base defeats assurance.

| Threat | Required control | This iteration / verification |
|---|---|---|
| Injection, collusion, forged approval | Server-side exact operation grants and independent administrative channel; no agent privilege escalation | Existing Core preserved; offline classifier tests only, no semantic guarantee |
| Direct ChatGPT/browser/shell bypass | Two VMs, dedicated identities, disabled shared clipboard/mounts, restricted Codex browser, enforced deny-all egress except Guardian | Infrastructure UNVERIFIED; real bypass test BLOCKED |
| Invisible/bidi/control text | Scalar validation, NFC proposal, flagged code points; retain original, explicit approval for changes | Executable offline tests in both directions |
| Loss of musical/math/multilingual meaning | No NFKC, confusable folding, default-ignorable stripping or silent normalization | Unicode preservation tests; reviewer decides flagged text |
| Forged/replayed/out-of-order transport | Independently provisioned component identity, mTLS, canonical closed envelopes, nonce/idempotency/order/epoch/TTL ledger | Contract/design only; no active transport |
| Partial/stale response, wrong conversation | Bound request/conversation/turn IDs, verified lifecycle marker and digest, stable capability contract; unknown remains held | No supported ChatGPT completion evidence; STOP rather than infer from idle DOM |
| Cancellation uncertainty, crash/reconnect retry | Durable dispatch intent, independent kill, persistent quarantine, no automatic resend/refund/resume | Existing synthetic core tests preserved; real browser/VM tests BLOCKED |
| Cookie/token theft or log disclosure | Guardian VM alone owns profile; extension no cookie/history/export permission; payload-only logs with externally enforced credential exclusion | No profile/credential access or transcript logging implemented |
| Audit tampering, root collusion | Independent retention-locked sink, signed checkpoint and admin separation | Local hashes are evidence only; immutable custody UNVERIFIED |
| Turns/spend/resource exhaustion | Transactional reservations, time/size/turn/concurrency caps, VM supervisor, provider-side controls where measurable | Offline message limits; no real subscription quota guarantee |
| Malicious extension/dependency/update | Pinned reviewed package/release signatures; no remotely hosted code; narrow host permissions; independent release admin | No extension installed; provenance UNVERIFIED |
| Service restriction/CAPTCHA/rate limit | Permitted supported integration and explicit stops on blocked/auth-expired/UI-changed conditions | Live route BLOCKED; no circumvention |

ALLOW/SANITIZE/BLOCK/REQUIRE_HUMAN_APPROVAL are inspection outcomes, never capabilities. SANITIZE produces a review candidate; it does not send or overwrite the original. Human approval must originate from an authenticated administrative workflow, not content claiming approval. A natural-language instruction can be hostile without suspicious characters; neither detection nor normalization prevents prompt injection.

Required negative test gates for the later isolated environment: outbound Executor-to-ChatGPT, access to Guardian profile/credentials, cross-project files, arbitrary process/browser control, forged extension origin, dropped/missing audit, stale epoch/replay/order, auth expiry/UI-change, uncertain cancellation, kill under partition, and crash/restart. Expected proof is firewall/ACL/process-supervisor denial and independently signed incident records. These tests are specified, not passed here.

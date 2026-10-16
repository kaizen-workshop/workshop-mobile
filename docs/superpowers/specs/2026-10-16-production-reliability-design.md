# Workshop Mobile: Production Reliability Design

## Objective

Harden the existing Expo/React Native application against stale authorized data,
insecure deployment configuration, expired access tokens during file transfers,
temporary-file retention, interrupted critical actions, and avoidable chat
reconnects. This is a mobile-only change based on `origin/develop`; it does not
merge branches or change server contracts.

## Scope and constraints

- Preserve the feature-oriented TypeScript architecture and current REST API.
- Production and staging API URLs must use HTTPS; development may use HTTP for
  local-device testing. A missing or malformed URL remains an error.
- Offline cache is a degraded-read mechanism only. It may serve snapshots after
  `network` or `timeout` errors, never after `unauthorized`, `forbidden`, or
  `not_found` responses. Authorization and absence errors must invalidate the
  affected snapshot where the cache interface supports it.
- A response successfully obtained from the API remains usable even if cache
  persistence fails.
- All authenticated file transfers must share one policy: bearer token,
  one controlled refresh after a 401, timeout/network normalization, and one
  retry with the refreshed token. Multipart retries reuse the same `FormData`
  payload and must not be added for endpoints lacking a server idempotency
  contract.
- Files held only in `FileSystem.cacheDirectory` are temporary. Remove them in
  a `finally` block after share completion/failure and clear the app-owned
  temporary-file registry during logout. Never delete a file already saved by
  the user through the native share sheet.
- Pending registration, cancellation, and payment operations retain their UUID
  idempotency key in user-scoped AsyncStorage until a definitive response.
  Reopening the app reuses the key; it must not create a replacement key for the
  same logical operation. Payment is not automatically replayed after restart
  because the API has no payment lookup by idempotency key. The UI refreshes
  registration/payment state and asks the user to retry with the retained key.
- Keep the custom STOMP client. It sends negotiated client heartbeat frames,
  closes silent connections through a watchdog, clears timers on every close or
  stop, schedules reconnection after token/socket-opening failures, serializes
  history pagination, and resynchronizes through REST after a successful
  reconnect.
- CI must run format check, lint, typecheck, unit tests, and integration tests
  on pull requests targeting `develop` and `main`. GitHub branch protection is
  configured in repository settings and therefore documented, not automated by
  the mobile app workflow.

## Architecture

### Error-aware cache reads

`workshop-loader.ts` and `feed-loader.ts` will depend on a small shared
predicate that accepts only `AppError` categories `network` and `timeout` for
fallback. Cache owners expose targeted removal for the list/detail key so a
404 or authorization failure cannot revive a stale object. Other errors retain
their current direct failure behavior.

### Authenticated transfer boundary

Introduce an authenticated transfer helper in `src/core/http` that owns token
reading, one 401 refresh, timeout, and response-to-`AppError` conversion. The
helper accepts a request factory so JSON remains on `HttpClient`, while multipart
uploads and binary downloads can use native `fetch`/Expo file-system adapters.
`api-admin-gateway.ts`, `authenticated-download.ts`, and
`workshop-attachment-opener.ts` consume it instead of independently refreshing
or fetching tokens.

The transfer helper tracks only temporary on-device URI paths it creates. A
`TemporaryFileRegistry` is injected into the session controller's existing
`beforeLogout` hook. The registry removes only registered cache URIs; browser
object URLs keep their current short-lived revocation behavior.

### Durable operation identity

Add a user-scoped `PendingOperationStore` with records keyed by operation kind
and resource identifier. UI hooks obtain an existing key before dispatching
register/cancel/pay and remove it only after a definitive HTTP response. Network
and timeout errors preserve it. On view mount, registration data is reloaded;
the pending key is reused only from an explicit user retry. Payments receive no
automatic replay, avoiding an implicit financial action after restart.

### Realtime lifecycle

The client completes STOMP heartbeats and treats errors before `onopen`, token
read rejection, and socket construction rejection as reconnectable while the
client is active. The chat screen keeps a single in-flight history request and
ignores a load-more request until it settles. Returning from background restarts
the realtime lifecycle and pulls REST history before relying on live frames.

## Tests and acceptance criteria

- Loader tests prove cache is used for network/timeout only and is cleared for
  401/403/404 where a target is known.
- Environment tests reject HTTP for staging/production and accept it only for
  development.
- Transfer tests prove one refresh/retry on 401, no retry for non-401 failures,
  cleanup after sharing, and logout registry cleanup.
- Operation-store tests prove a key survives store recreation, is user scoped,
  and remains after a transient payment failure.
- Chat tests prove heartbeats, watchdog closure, opening failure reconnection,
  no concurrent history fetches, and resync after reconnection.
- CI is checked locally with the same commands it runs remotely. Native Android
  and iOS builds remain a release-gate task because they require platform/EAS
  credentials and a device/build environment.

## Out of scope

- Backend endpoint additions, payment-provider integration, and a server-side
  operation-status API.
- Automatic branch protection or release promotion; maintainers must configure
  required review, required checks, and no direct pushes for `develop` and
  `main` in GitHub.
- Persistent offline write queue, conflict resolution, incremental sync, and
  real push-provider delivery. These remain TASK-065 through TASK-067 and
  TASK-057 follow-up work.

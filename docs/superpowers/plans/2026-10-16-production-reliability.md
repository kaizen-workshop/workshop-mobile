# Production Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden cached data, configuration, authenticated transfers, operation identity, chat, and CI without changing backend contracts.

**Architecture:** Small core policies govern cache fallback, binary/multipart authentication, temporary-file ownership, and durable idempotency. Routes consume them. The custom STOMP client gains lifecycle controls, avoiding a new dependency.

**Tech Stack:** Expo 57, React Native, TypeScript, AsyncStorage, Expo FileSystem/Sharing, Jest, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-16-production-reliability-design.md`

## Global Constraints

- Do not modify the backend or automatically replay a payment.
- Accept HTTP only in the development variant.
- Only AppError categories network and timeout may use offline cache.
- Test every behavior RED then GREEN; run the full suite before task completion.
- Do not stage `jest-baseline.json`.

## Review Focus

- A second 401 after refresh clears the session rather than showing cache.
- A failed share still removes app-owned temporary cache files.
- One user's idempotency key cannot be read by another user.
- A failure before WebSocket open schedules one reconnect while active.
- CI uses npm ci and executes unit plus integration tests.

---

### Task 1: Secure environment and cache policy

**Files:** environment config, feed/workshop loaders and caches; their Jest tests.

**Produces:** `isOfflineFallbackError(error)`; targeted cache-removal methods.

- [ ] Write failing tests: production/staging HTTP rejected; development HTTP accepted; only network/timeout use snapshots; 401/403/404 reject and remove affected snapshots.
- [ ] Run `npm test -- --runInBand tests/core/config/environment.test.ts tests/workshop/data/workshop-loader.test.ts tests/feed/data/feed-loader.test.ts`; confirm RED.
- [ ] Implement HTTPS validation, shared fallback predicate, cache key removers, and targeted eviction.
- [ ] Run focused tests and `npm test -- --runInBand`; confirm GREEN.
- [ ] Commit: `fix: restrict offline cache and production transport`.

### Task 2: Authenticated transfers and temporary-file cleanup

**Files:** new core authenticated-transfer and temporary-file-registry; HTTP index/download; attachment opener; admin gateway; session controller; root layout; focused tests.

**Produces:** `createAuthenticatedTransfer({ config, tokenStorage, refreshSession, fetchImpl })` and a registry with `register(uri)` / `clear()`.

- [ ] Write failing tests: one 401 refresh/retry, no retry for non-401, cleanup after successful/failed sharing, and logout removes registered cache paths only.
- [ ] Run focused transfer, download, attachment, and session tests; confirm RED.
- [ ] Implement injected adapters, a single refresh/retry policy, registry ownership, and finally cleanup.
- [ ] Migrate exports, attachments, and multipart uploads while preserving multipart boundaries and avoiding uncertain upload retries.
- [ ] Run `npm test -- --runInBand` and `npm run typecheck`; confirm GREEN.
- [ ] Commit: `fix: unify authenticated file transfers`.

### Task 3: Durable critical-operation identity

**Files:** new core pending-operation store; workshop details route; persistence and route tests.

**Produces:** `getOrCreate(userId, kind, resourceId)` and `complete(userId, kind, resourceId)`.

- [ ] Write failing tests: a recreated store keeps a key, users are isolated, completion removes it, and a transient payment error retains it.
- [ ] Run focused store and workshop-route tests; confirm RED.
- [ ] Persist compact user-scoped records; clear only after definitive success; reuse a retained key only after explicit user retry; never auto-replay payment.
- [ ] Run full Jest and typecheck; confirm GREEN.
- [ ] Commit: `fix: persist critical operation identities`.

### Task 4: STOMP lifecycle and chat pagination

**Files:** realtime client, chat route, client/route tests.

**Produces:** heartbeat, silence watchdog, reconnect-safe setup, and one in-flight history request.

- [ ] Write failing tests for heartbeat, watchdog, rejected token read, socket-factory error, REST resync, and simultaneous load-more requests.
- [ ] Run focused chat tests; confirm RED.
- [ ] Catch setup failures, schedule only one reconnect, clear timers on close/stop, and add a paging ref reset in finally.
- [ ] Run full Jest and typecheck; confirm GREEN.
- [ ] Commit: `fix: harden chat reconnection lifecycle`.

### Task 5: Version CI and document branch settings

**Files:** new `.github/workflows/ci.yml`; README.

- [ ] Document required GitHub settings: review, CI check, and no direct pushes for develop/main.
- [ ] Add PR/manual workflow using Node 24, npm ci, format check, lint, typecheck, unit tests, and integration tests.
- [ ] Run equivalent local commands: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, and `npm run test:integration`.
- [ ] Commit: `ci: validate mobile pull requests`.


# Milestone 0 — Foundation: design

## Scope

This document covers TASK-001 through TASK-007 only. It establishes a
testable mobile base without creating product screens, API endpoints, or
authentication flows. The OpenAPI contract is not present in this repository;
therefore this foundation does not assume endpoint paths, request fields, or
response bodies.

## Technical decisions

The application uses the already-initialized Expo managed workflow, React
Native, and TypeScript. Expo Router provides file-based navigation. The
versions are pinned by `package.json` through the Expo SDK 57 dependency set.

| Concern                   | Decision                                               | Rationale                                                                                               |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Navigation                | Expo Router                                            | Already configured by the starter project and native to Expo.                                           |
| Shared state              | React Context, only when a shared state first needs it | Avoids global-state dependencies before an actual shared flow exists.                                   |
| HTTP                      | Native `fetch` behind a small client                   | Supports the required timeout, headers, JSON serialization, and controlled error mapping without Axios. |
| Non-sensitive persistence | `@react-native-async-storage/async-storage`            | Common Expo-compatible storage for future cacheable data.                                               |
| Token storage             | `expo-secure-store`                                    | Uses the platform secure storage mechanism for access and refresh tokens.                               |
| WebSocket                 | Native `WebSocket`                                     | No chat implementation is in this milestone.                                                            |
| Push notifications        | `expo-notifications`                                   | Expo-compatible push integration, configured only when the notification tasks begin.                    |
| Tests                     | Jest with `jest-expo`                                  | Unit-test support in the Expo environment.                                                              |
| Lint / format             | Expo ESLint and Prettier                               | Standard, explicit quality commands.                                                                    |

No password, backend secret, administrative token, payment data, or API
contract fixture is stored in the application.

## Module structure

```text
app/                         Expo Router route composition only
src/
  core/
    config/                  environment parsing and validation
    http/                    HTTP client and normalized failures
    secure-storage/          access/refresh token-only storage API
  shared/                    cross-feature UI or utilities when actual reuse exists
  auth/
  onboarding/
  profile/
  preferences/
  feed/
  workshop/
  registration/
  payment/
  calendar/
  group/
  chat/
  notification/
  evaluation/
  settings/
```

Each feature initially exposes only a boundary file and has no invented
models, endpoints, mock data, or screens. A feature gains implementation only
within its corresponding task. `core` owns technical cross-cutting concerns;
it does not contain business rules.

## Environment configuration

The app recognizes the public variant `APP_VARIANT` with exactly these values:
`development`, `staging`, and `production`. `EXPO_PUBLIC_API_URL` is the
externally supplied public API base URL. At startup, configuration is validated
and an invalid or missing value fails clearly during development rather than
silently choosing a server.

Public Expo variables are not secrets. Local environment files remain ignored;
an `.env.example` documents only variable names and safe placeholder values.

## HTTP and errors

The HTTP client is invoked only by a feature. It builds URLs from the validated
base URL, applies common JSON headers, serializes JSON request bodies, and
uses `AbortController` for a finite timeout. It has no endpoint-specific logic,
authentication behavior, refresh logic, automatic retry, or offline queue.

Every failure becomes a normalized application error with a stable category,
optional HTTP status, and optional API business code. Categories cover network,
timeout, client HTTP errors (400, 401, 403, 404, and 409), server errors (500
and other 5xx), and unknown failures. Technical API text is preserved only for
diagnostics and is not a UI message. Features map the normalized category/code
to user-facing copy when their product requirements exist.

## Secure storage

The secure-storage API can read, write, and clear only `accessToken` and
`refreshToken` using `expo-secure-store`. It has no password operation and does
not log token values. AsyncStorage is deliberately unavailable to this API.

## Runtime flow

```text
application start
  -> validate environment
  -> mount route composition
  -> feature explicitly calls HTTP client
  -> receive response or normalized failure
  -> feature owns its loading/success/empty/error/refreshing UI state
```

Network and timeout errors remain distinguishable so later features can offer
safe retries. This milestone does not claim offline writes are supported.

## Verification

Automated tests cover environment validation, HTTP URL/header/body behavior,
timeouts, HTTP/network error normalization, and secure token key restrictions.
Quality gates are `npm run lint`, `npx tsc --noEmit`, `npm test`, and a static
Expo web export. Android and iOS builds are attempted only with locally
available platform tooling; their actual result is reported rather than
assumed.

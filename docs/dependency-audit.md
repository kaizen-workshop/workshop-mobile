# Dependency audit baseline

Baseline reviewed on 2026-10-06 for Expo SDK 57.

`npm audit fix --package-lock-only --omit=dev` applied every compatible lockfile
update offered by npm. The remaining report contains 62 transitive findings (45 high,
17 moderate and no critical findings). npm only offers `--force` remediations that
downgrade Expo to SDK 44 or move individual packages to versions outside the SDK 57
compatibility matrix, so those remediations are intentionally not applied.

The remaining direct advisory chains are:

- Expo CLI, Metro and Jest build/test tooling through `braces`, `micromatch` and
  `node-forge`;
- Expo config/prebuild tooling through `xcode` and `uuid`;
- Istanbul test instrumentation through `js-yaml`, `argparse` and `sprintf-js`;
- Expo Router through `query-string` and `decode-uri-component`;
- the SDK-pinned React Native/Reanimated/Worklets toolchain.

The CI gate is `npm run audit:dependencies`. It fails on critical findings while still
printing moderate/high findings for review. Re-run the full audit on every Expo SDK
upgrade and remove this baseline when compatible upstream versions clear the chains.
Do not run `npm audit fix --force` on this project.

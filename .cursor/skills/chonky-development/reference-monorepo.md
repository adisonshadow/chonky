# Chonky monorepo reference

Use this file when editing workspace packages, Yarn workspaces, or repository layout.

## Package manager and installs

- **Package manager**: Yarn 4 (Berry). Enable via Corepack: `corepack prepare yarn@4 --activate`.
- **Install dependencies**: From the repository root, run `yarn install`.
- **Do not add dependencies by hand-editing `package.json`**. Use:
  - Root dev deps: `yarn add -D <pkg> -w`
  - A workspace package: `yarn workspace @chonkylang/<name> add [-D] <pkg>`
- **Build all packages**: `yarn build` (runs workspace builds in topological order).
- **Tests at root**: `yarn test` (Vitest; includes `tests/e2e/` when configured).

## Workspace packages (`packages/*`)

| Directory | Package | Role |
|-----------|---------|------|
| `packages/core` | `@chonkylang/core` | Unified entry, re-exports |
| `packages/transpiler` | `@chonkylang/transpiler` | Babel/SWC plugin, `ChonkyConfig` types |
| `packages/runtime` | `@chonkylang/runtime` | Browser runtime, `defineRequirement`, test helpers |
| `packages/cli` | `@chonkylang/cli` | `chonky` CLI |
| `packages/devtools` | `@chonkylang/devtools` | DevTools panel |
| `packages/ui` | `@chonkylang/ui` | Optimized components |
| `packages/vite-plugin` | `@chonkylang/vite-plugin` | Vite integration |
| `packages/webpack-plugin` | `@chonkylang/webpack-plugin` | Webpack integration |

Other notable paths: `examples/todomvc` (reference app), `docs/` (specs), `crates/chonkyc` (Phase-2 compiler).

## Full directory map

See [project-structure.md](../../../docs/project-structure.md) for the complete tree and per-package notes.

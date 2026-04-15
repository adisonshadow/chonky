# @chonkylang/core

**Chonky** is a machine-first web language for AI-driven development. This package is the **single import surface** for TypeScript types, compile-time APIs from the transpiler, and browser runtime helpers—so agents and humans can depend on one package name while the toolchain stays modular.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## What this package does

- **Re-exports `@chonkylang/transpiler`**: configuration loading (`loadChonkyConfig`, `loadPolicyManifest`), the `chonkyBabelPlugin`, `preprocess` for `machine:assert` blocks, semantic view / revert helpers, ID utilities, and all exported **TypeScript types** (`ChonkyConfig`, manifests, triggers, ambiguity and optimizer settings, and more).
- **Re-exports `@chonkylang/runtime`**: `defineRequirement`, `verify`, `ChonkyRenderer`, `_ChonkyWrapper`, and runtime types for render metadata and component trees.

Use **`@chonkylang/core`** when you want documentation and imports to reference one dependency; use the split packages when you need a minimal install (for example, build-only servers that should not pull React).

## Installation

```bash
npm install @chonkylang/core --save-dev
```

Peer / nested behavior follows the underlying packages: transpiler work expects a Babel-capable pipeline; runtime APIs expect React where components are involved.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| **`@chonkylang/core`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

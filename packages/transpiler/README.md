# @chonkylang/transpiler

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/transpiler`** is the **compile-time engine**: it preprocesses Chonky-specific syntax, runs **Babel AST transforms**, loads **`chonky.config`**, and exposes helpers for semantic translation and revert workflows.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Capabilities

- **`preprocess`**: Transforms **`machine:assert`** blocks and related surface syntax into code the rest of the pipeline can compile.
- **`chonkyBabelPlugin`**: Core plugin invoked with project root and mode (`development` | `production`). Rewrites **`defineRequirement`** into manifest emission, injects dev-only instrumentation (for example wrappers that talk to **`@chonkylang/runtime`**), and applies Chonky-specific semantics per your config.
- **Configuration**: **`loadChonkyConfig`** / **`loadPolicyManifest`** resolve structured settings for verification, ambiguity rules, silent mode, optimizers, and interactions—single source of truth for CLI and bundler plugins.
- **Tooling helpers**: Requirement ID validation, Chonky ID generation, output directory helpers, **`toSemanticView`** / **`fromSemanticView`** for human-readable vs machine-oriented source workflows.
- **Types**: Full **TypeScript** models for requirements, manifests, triggers, policies, and reports—shared across CLI, plugins, and **`@chonkylang/core`**.

## Peer dependency

- **`@babel/core`** `^7`

## Installation

```bash
npm install @chonkylang/transpiler @babel/core --save-dev
```

Bundler integration is usually done via **`@chonkylang/vite-plugin`** or **`@chonkylang/webpack-plugin`**, which call this package for you.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| **`@chonkylang/transpiler`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

# @chonkylang/cli

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/cli`** exposes the **`chonky`** binary: scaffolding, local dev orchestration, production builds, dependency graphs, optimization passes, semantic “view” translation, and safe revert flows—all driven by the same config and manifests as the transpiler and runtime.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Commands

| Command | Purpose |
| --- | --- |
| **`init`** | Interactive project bootstrap aligned with Chonky conventions (config, scripts, structure). |
| **`dev`** | Development workflow with metadata collection suitable for AI and DevTools. |
| **`build`** | Production-oriented build pipeline integration with Chonky transforms. |
| **`graph`** | Emit or inspect **module / requirement dependency graphs** for multi-agent coordination and conflict awareness. |
| **`optimize`** | Run or preview **optimizer** flows defined in your Chonky config (performance, assets, thresholds). |
| **`view`** | **Semantic translation** of Chonky-oriented sources for human inspection (pairs with transpiler semantic helpers). |
| **`revert`** | **Revert** semantic-view or generated artifacts using structured metadata from the toolchain. |

The CLI depends on **`@chonkylang/transpiler`** and **`@chonkylang/runtime`** so commands stay aligned with what your bundler plugin compiles.

## Installation

```bash
npm install @chonkylang/cli --save-dev
```

Run:

```bash
npx chonky --help
```

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| **`@chonkylang/cli`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

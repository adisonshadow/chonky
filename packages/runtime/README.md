# @chonkylang/runtime

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/runtime`** is the **browser (and test) runtime**: requirement definitions, lightweight verification, render-metadata collection, and the dev-only wrapper that instruments React components so tools (and LLMs) can inspect UI structure without screenshots.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Capabilities

- **`defineRequirement`**: Typed, structured requirement objects in source. At compile time the transpiler strips the call and emits **manifest JSON**; at runtime this remains an identity function so the same module runs in the browser.
- **`verify`**: Development-only assertion helper tied to requirement IDs. Failures are logged and recorded on `window.__CHONKY_LOGS__` for tooling; **production builds no-op** and tree-shake away.
- **`ChonkyRenderer`**: Singleton that maintains **`window.__CHONKY_RENDER_META__`**—a structured graph of components, instances, props snapshots, render events, and timing—so agents can query the live UI like data.
- **`_ChonkyWrapper`**: Injected in **development** by the Babel plugin to wrap components, track mount/update/unmount, and feed the renderer. Removed from production bundles.
- **`@chonkylang/runtime/test`**: Vitest-oriented test entry for generated or hand-written tests around Chonky behavior.

## Peer dependency

- **React** `^18 || ^19` (for wrapper and renderer integration).

## Installation

```bash
npm install @chonkylang/runtime --save-dev
```

For full Chonky behavior, pair this with **`@chonkylang/transpiler`** (or **`@chonkylang/vite-plugin`** / **`@chonkylang/webpack-plugin`**) so manifests and wrappers are emitted at build time.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| **`@chonkylang/runtime`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

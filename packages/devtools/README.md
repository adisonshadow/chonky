# @chonkylang/devtools

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/devtools`** provides a small **browser DevTools integration layer**: a **`DevToolsBridge`** that listens for **`postMessage`** traffic between a **Chonky DevTools panel** (extension or embedded UI) and **`@chonkylang/runtime`** in the inspected page, so render metadata and events can be visualized without custom wiring in every app.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Capabilities

- **`DevToolsBridge`**: `connect()` / `disconnect()` around `window` message listeners; tracks connection state, event counts, and timestamps.
- **Typed messages**: **`DevToolsMessage`** with `source: 'chonky-devtools' | 'chonky-runtime'`, arbitrary **`type`**, and **`payload`** for extensible protocols.
- **Pub/sub API**: **`on(type, handler)`** returns an unsubscribe function; **`send(type, payload)`** posts commands from the panel into the page.
- **Pairs with runtime**: Consumes the same metadata surfaces the runtime exposes (for example **`window.__CHONKY_RENDER_META__`** and log buffers) when your panel forwards or queries them.

Use this package when you build or extend the **Chonky DevTools panel**; app authors normally install **`@chonkylang/runtime`** and a bundler plugin first.

## Installation

```bash
npm install @chonkylang/devtools --save-dev
```

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| **`@chonkylang/devtools`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

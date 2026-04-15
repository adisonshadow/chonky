# @chonkylang/ui

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/ui`** ships **React components** that are friendly to Chonky’s **render metadata** and optimization story: explicit props, predictable DOM attributes, and hooks for autonomous tuning (for example **`onOptimize`** callbacks with structured **`ImageOptimizeInfo`**).

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Components

### `Image`

- **`lazyLoad`**: Optional **IntersectionObserver** + native `loading="lazy"` for deferred work.
- **`fallbackSrc`**: Error recovery path without losing layout signals.
- **`optimizedSrc` / `quality`**: Plugs into silent-mode / optimizer flows where the toolchain supplies better URLs or quality hints.
- **`onOptimize`**: Emits structured metadata (dimensions, format, optional byte sizes) after load so agents can verify visual requirements numerically.
- **`data-chonky-*` attributes**: Stable handles for metadata collectors and DevTools.

## Peer dependency

- **React** `^18 || ^19`

## Installation

```bash
npm install @chonkylang/ui --save-dev
```

This package depends on **`@chonkylang/runtime`** for consistent instrumentation patterns; ensure your bundler runs the Chonky plugin when you use `.cts` or advanced syntax.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| **`@chonkylang/ui`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

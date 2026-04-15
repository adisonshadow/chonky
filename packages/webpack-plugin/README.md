# @chonkylang/webpack-plugin

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/webpack-plugin`** registers a **Webpack 5** integration that prepends a **custom loader** to `*.ts`, `*.tsx`, `*.js`, and `*.jsx` modules. The loader applies the same **preprocess + Babel + `chonkyBabelPlugin`** pipeline as the Vite plugin, using your **`chonky.config`** and effective **`mode`**.

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## Capabilities

- **`ChonkyWebpackPlugin`**: `apply(compiler)` injects the loader at the **front** of `module.rules` so Chonky runs before the rest of your pipeline.
- **Loader (`chonkyWebpackLoader`)**: Per-file transform with `projectRoot` and `mode` options, delegating to **`@chonkylang/transpiler`** for parity with Vite behavior.
- **CJS-first publish**: Default export is the plugin class; suitable for classic **`require('@chonkylang/webpack-plugin')`** Webpack configs.

## Usage

```js
const ChonkyWebpackPlugin = require('@chonkylang/webpack-plugin').default;

module.exports = {
  plugins: [
    new ChonkyWebpackPlugin({ projectRoot: __dirname }),
  ],
};
```

## Peer dependency

- **Webpack** `^5`

## Installation

```bash
npm install @chonkylang/webpack-plugin webpack @babel/core --save-dev
```

Also add **`@chonkylang/runtime`** (and **`@chonkylang/cli`** if you use CLI workflows) to the application workspace.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| `@chonkylang/vite-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| **`@chonkylang/webpack-plugin`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

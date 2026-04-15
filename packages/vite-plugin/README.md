# @chonkylang/vite-plugin

**Chonky** is a machine-first web language for AI-driven development. **`@chonkylang/vite-plugin`** wires Chonky into **Vite** as a **`pre`** plugin: it preprocesses sources, runs **Babel** with **`chonkyBabelPlugin`**, and respects your project’s **`chonky.config`** and Vite mode (`development` / `production`).

**Project home:** [github.com/adisonshadow/chonky](https://github.com/adisonshadow/chonky)

## What it transforms

- Files matching **`*.ts`, `*.tsx`, `*.js`, `*.jsx`** outside `node_modules`.
- **`machine:assert`** regions via **`preprocess`** before Babel.
- **`defineRequirement`** and related patterns via the Chonky Babel plugin.
- In **development**, **`.tsx` / `.jsx`** files additionally go through the plugin so **render metadata** and dev instrumentation (for example **`_ChonkyWrapper`**) stay active; production mode tightens what runs so debug-only code can tree-shake.

## API

```ts
import { chonkyVitePlugin } from '@chonkylang/vite-plugin';

export default {
  plugins: [
    chonkyVitePlugin({ projectRoot: process.cwd() /* optional */ }),
  ],
};
```

## Peer dependency

- **Vite** `^5 || ^6 || ^7 || ^8`

## Installation

```bash
npm install @chonkylang/vite-plugin vite @babel/core --save-dev
```

You typically also install **`@chonkylang/runtime`** (and optionally **`@chonkylang/cli`**) in the same app.

## Chonky ecosystem (all packages)

| Package | README |
| --- | --- |
| `@chonkylang/core` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/core/README.md) |
| `@chonkylang/runtime` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/runtime/README.md) |
| `@chonkylang/transpiler` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/transpiler/README.md) |
| `@chonkylang/cli` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/cli/README.md) |
| **`@chonkylang/vite-plugin`** (this package) | [README](https://github.com/adisonshadow/chonky/blob/main/packages/vite-plugin/README.md) |
| `@chonkylang/webpack-plugin` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/webpack-plugin/README.md) |
| `@chonkylang/ui` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/ui/README.md) |
| `@chonkylang/devtools` | [README](https://github.com/adisonshadow/chonky/blob/main/packages/devtools/README.md) |

## License

MIT — see the [repository](https://github.com/adisonshadow/chonky).

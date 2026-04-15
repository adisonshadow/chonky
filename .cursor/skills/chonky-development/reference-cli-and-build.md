# CLI and build integration reference

Use this file for `chonky` commands, `chonky.config.js`, bundler plugins, and ambiguity report paths.

## Initialize an application project

Install `@chonkylang/cli` (globally or as a devDependency), then:

```bash
chonky init [project-name] [--template default|minimal] [--force]
```

- **`default`**: React + sample `defineRequirement` scaffold.
- **`minimal`**: No UI shell; minimal TypeScript entry.

Then install dependencies (`yarn install` or `npm install` per the generated project) and add `@chonkylang/core`, `@chonkylang/runtime`, and build plugins as needed.

## `chonky.config.js`

Project root should include `chonky.config.js` exporting a `ChonkyConfig` object (types from `@chonkylang/transpiler`):

- **`verification`**: e.g. `strictBinding` for requirement ID rules.
- **`ambiguity`**: path to `pm-requirement.json`, `strictMode`, report output under `.chonky/`.
- **`optimizer`**: silent-mode thresholds and interaction defaults for `chonky optimize`.

Example (abbreviated):

```js
/** @type {import('@chonkylang/transpiler').ChonkyConfig} */
module.exports = {
  verification: { strictBinding: true },
  ambiguity: {
    policyManifest: './pm-requirement.json',
    strictMode: false,
    generateReport: true,
    reportPath: '.chonky/ambiguity-report.json',
  },
  optimizer: { /* ... */ },
};
```

Silent mode / prompts: [spec-silent-mode-and-interaction.md](../../../docs/spec-silent-mode-and-interaction.md).

## CLI commands

| Command | Purpose |
|--------|---------|
| `chonky dev` | Development loop; preprocesses `machine:assert`, integrates with config |
| `chonky build` | Transpile with Chonky Babel plugin; emit artifacts under `.chonky/` |
| `chonky graph` | Dependency graph from requirement manifests (JSON/dot/mermaid) |
| `chonky requirements search` | Search compiled manifests (`--json` / `--all` for agents) |
| `chonky optimize` | Asset / suggestion pass driven by `optimizer` config |
| `chonky view <file>` | Human-readable “semantic view” of machine-oriented source |
| `chonky revert <file>` | Reverse direction toward machine-oriented output (`--dry-run`, `--apply-babel`) |

## Bundler integration

For app bundling, wire **`@chonkylang/vite-plugin`** or **`@chonkylang/webpack-plugin`** so transforms run in dev and production pipelines.

## Ambiguity policy

Place **`pm-requirement.json`** at the project root (or the path set in config). It lists excluded imports/components/APIs and optional negate patterns. When configured, the transpiler reports to `.chonky/ambiguity-report.json`.

Details: [spec-ambiguity-resolution-protocol.md](../../../docs/spec-ambiguity-resolution-protocol.md).

## Testing (monorepo and generated)

- **Generated tests**: Beside sources; Vitest via `@chonkylang/runtime/test`.
- **This monorepo**: `yarn test` at root; e2e in `tests/e2e/`.
- **Runtime helpers**: `verify()` for dev-time checks; render metadata via `ChonkyRenderer` — [spec-render-metadata-protocol.md](../../../docs/spec-render-metadata-protocol.md).

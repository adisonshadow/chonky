# Chonky — AI development playbook

This document is **tool-agnostic**: it works as project knowledge for any AI coding assistant, not a specific IDE. Copy it into a wiki, system prompt, or `AGENTS.md`-style entry as needed.

The canonical **Cursor Agent Skill** for this repository (routing tables and progressive reference files) lives under `.cursor/skills/chonky-development/`. To install or use that layout in Cursor, read **[cursor-chonky-agent-skills-guide.md](cursor-chonky-agent-skills-guide.md)**.

## What Chonky is (short)

Chonky is a TypeScript-oriented, **machine-first** web stack: structured requirements (`defineRequirement`), verifiable scenarios (`machine:assert`), optional render metadata, and ambiguity policies. The toolchain lives in this monorepo under `packages/*`.

## Install and repo hygiene (this monorepo)

- **Package manager**: Yarn 4 (Berry). Enable via Corepack: `corepack prepare yarn@4 --activate`.
- **Install dependencies**: From the repository root, run `yarn install`.
- **Do not add dependencies by hand-editing `package.json`**. Use:
  - Root dev deps: `yarn add -D <pkg> -w`
  - A workspace package: `yarn workspace @chonkylang/<name> add [-D] <pkg>`
  This keeps the lockfile consistent.
- **Build all packages**: `yarn build` (runs workspace builds in topological order).
- **Tests at root**: `yarn test` (Vitest; includes `tests/e2e/` when configured).

See [project-structure.md](project-structure.md) for directory layout.

## Initialize an application project

Use the CLI after installing `@chonkylang/cli` (globally or as a devDependency):

```bash
chonky init [project-name] [--template default|minimal] [--force]
```

- **`default`**: React + sample `defineRequirement` scaffold.
- **`minimal`**: No UI shell; minimal TypeScript entry.

Then install dependencies (`yarn install` or `npm install` per the generated project) and add `@chonkylang/core`, `@chonkylang/runtime`, and build plugins as needed.

A working reference app lives under [examples/todomvc](../examples/todomvc) (`chonky.config.js`, `pm-requirement.json`, requirements, and `machine:assert` samples).

## Configuration file

Project root should include `chonky.config.js` exporting a `ChonkyConfig` object (see `@chonkylang/transpiler` types):

- **`verification`**: e.g. `strictBinding` for requirement ID rules.
- **`ambiguity`**: path to `pm-requirement.json`, `strictMode`, report output under `.chonky/`.
- **`optimizer`**: silent-mode thresholds and interaction defaults for `chonky optimize`.

Example shape (abbreviated):

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

## Authoring requirements

### `defineRequirement`

- Import from `@chonkylang/runtime` (runtime is a no-op; manifests are emitted at build time).
- Use a stable requirement ID matching `REQ-<MODULE>-<SEQ>` (see [spec-structured-requirement-definition.md](spec-structured-requirement-definition.md)).
- Keep **`id`**, **`triggers`**, and other fields as plain serializable data in the object literal.

```ts
import { defineRequirement } from '@chonkylang/runtime';

export const myReq = defineRequirement({
  id: 'REQ-EXAMPLE-01',
  name: 'Example',
  triggers: [{ type: 'UI_EVENT', target: 'Button#go', event: 'click' }],
});
```

Build output includes `.chonky/requirements/<ID>.json` and an index under `.chonky/requirements/`.

### `machine:assert`

Write scenarios in source; the preprocessor lowers them to `__chonky_assert__` for the Babel plugin:

```ts
machine:assert for "REQ-EXAMPLE-01" {
  scenario("Happy path", () => {
    expect(true).toBe(true);
  });
}
```

Generated tests typically land next to the file under `__tests__/<REQ-ID>.test.ts` and import from `@chonkylang/runtime/test` (Vitest re-exports).

### Comments and copy

- **All code comments must be English** (including `//`, block, and doc comments). User-visible UI strings may be localized.
- Do not rely on IDE-specific rules files alone—follow this in every edit.

## Build and CLI commands

| Command | Purpose |
|--------|---------|
| `chonky dev` | Development loop; preprocesses `machine:assert`, integrates with config |
| `chonky build` | Transpile with Chonky Babel plugin, emit artifacts under `.chonky/` |
| `chonky graph` | Dependency graph from requirement manifests (JSON/dot/mermaid) |
| `chonky requirements search` | Search compiled manifests (`--json` / `--all` for agents) |
| `chonky optimize` | Asset / suggestion pass driven by `optimizer` config |
| `chonky view <file>` | Human-readable “semantic view” of machine-oriented source |
| `chonky revert <file>` | Reverse direction toward machine-oriented output (`--dry-run`, `--apply-babel`) |

For app bundling, wire **`@chonkylang/vite-plugin`** or **`@chonkylang/webpack-plugin`** so transforms run in dev and production pipelines.

## Ambiguity policy

Place **`pm-requirement.json`** at the project root (or path set in config). It lists excluded imports/components/APIs and optional negate patterns. The transpiler reports to `.chonky/ambiguity-report.json` when configured.

Details: [spec-ambiguity-resolution-protocol.md](spec-ambiguity-resolution-protocol.md).

## Testing

- **Generated tests**: Produced beside sources; use Vitest (`@chonkylang/runtime/test`).
- **This monorepo**: `yarn test` at root; e2e coverage in `tests/e2e/`.
- **Runtime helpers**: `verify()` for dev-time checks; render metadata via `ChonkyRenderer` / protocol in [spec-render-metadata-protocol.md](spec-render-metadata-protocol.md).

## Deep dives (specs)

| Topic | Document |
|--------|-----------|
| Requirement schema | [spec-structured-requirement-definition.md](spec-structured-requirement-definition.md) |
| Verification / `machine:assert` | [spec-verification-engine.md](spec-verification-engine.md) |
| Render metadata | [spec-render-metadata-protocol.md](spec-render-metadata-protocol.md) |
| Ambiguity | [spec-ambiguity-resolution-protocol.md](spec-ambiguity-resolution-protocol.md) |
| Silent mode / CLI prompts | [spec-silent-mode-and-interaction.md](spec-silent-mode-and-interaction.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |

## Quick checklist for AI-assisted edits

1. Prefer Yarn commands for dependencies; never hand-edit `package.json` for new packages.
2. Use valid requirement IDs and keep requirement objects JSON-serializable.
3. Use `machine:assert` syntax exactly; run `chonky build` or plugin pipeline to refresh manifests and tests.
4. Respect `pm-requirement.json` when adding imports or APIs.
5. Keep code comments in English; align user-facing copy with product language requirements.

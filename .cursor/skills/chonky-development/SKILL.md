---
name: chonky-development
description: >-
  Operates the Chonky machine-first TypeScript stack in this Yarn 4 monorepo: @chonkylang/* packages,
  defineRequirement and machine:assert authoring, chonky.config.js, pm-requirement.json and ambiguity
  reports, chonky CLI (init, dev, build, graph, requirements search, optimize, view, revert),
  @chonkylang/vite-plugin and @chonkylang/webpack-plugin, .chonky/ artifacts, examples/todomvc, Vitest
  and tests/e2e. Use when the user edits transpiler/runtime/cli/plugins, requirements, verification
  scenarios, or asks how to build, test, or integrate Chonky in apps or this repository.
---

# Chonky — AI assistant playbook (project skill)

This skill is **tool-agnostic** knowledge for AI assistants working in the Chonky repository or Chonky-style app projects. Progressive detail lives in `reference-*.md` files in this same folder.

## Role

Chonky is a TypeScript-oriented, **machine-first** web stack: structured requirements (`defineRequirement`), verifiable scenarios (`machine:assert`), optional render metadata, and ambiguity policies. The reference implementation lives under `packages/*` in this monorepo.

## Routing: which file to read next

| User intent | Open |
|-------------|--------|
| Yarn workspaces, package boundaries, `yarn build` / `yarn test`, repo layout | [reference-monorepo.md](reference-monorepo.md) |
| `defineRequirement`, `machine:assert`, requirement IDs, generated tests | [reference-authoring.md](reference-authoring.md) |
| `chonky` CLI, `chonky.config.js`, Vite/Webpack plugins, `pm-requirement.json` | [reference-cli-and-build.md](reference-cli-and-build.md) |
| Deep protocol questions; link hub for specs | [reference-specs-index.md](reference-specs-index.md) |

## Non-negotiables

Hard constraints for this repository (dependency policy, comment language, structure) are defined in the Cursor rule file: [chonky-ai-coding.mdc](../../rules/chonky-ai-coding.mdc). Follow it on every edit.

## Minimal workflows

**Add a dependency (this monorepo)**  
Use Yarn only; never hand-edit `package.json` to add packages. See [reference-monorepo.md](reference-monorepo.md).

**Change requirements or `machine:assert`**  
Keep IDs and object literals serializable; run `chonky build` or the app’s bundler pipeline so `.chonky/` manifests and generated tests refresh. See [reference-authoring.md](reference-authoring.md).

**Wire an app**  
Add `chonky.config.js`, `pm-requirement.json` as needed, and Vite or Webpack plugin. See [reference-cli-and-build.md](reference-cli-and-build.md).

## Quick checklist for AI-assisted edits

1. Prefer Yarn commands for dependencies; never hand-edit `package.json` for new packages.
2. Use valid requirement IDs and keep requirement objects JSON-serializable.
3. Use `machine:assert` syntax exactly; run `chonky build` or the plugin pipeline to refresh manifests and tests.
4. Respect `pm-requirement.json` when adding imports or APIs.
5. Keep code comments in English; align user-facing copy with product language requirements.

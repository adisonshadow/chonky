# Cursor and Chonky: Agent Skills guide

This document explains the **project-level Agent Skills** shipped with the Chonky repository, how humans install or reuse them in other projects, and how AI coding assistants should consume them efficiently.

For a **tool-agnostic** Chonky development reference (requirements, CLI, specs) without focusing on Cursor’s Skills feature, see **[chonky-ai-development-playbook.md](chonky-ai-development-playbook.md)**.

## What are Chonky Agent Skills?

**Agent Skills** in Cursor (and similar tools) are Markdown instruction bundles that teach an assistant **how to work in a specific codebase or domain**. In this repository they live under:

- `.cursor/skills/chonky-development/` — primary skill and reference files

**Skills vs rules**

| Artifact | Typical role |
|----------|----------------|
| `.cursor/rules/*.mdc` | Hard constraints (package manager policy, comment language, monorepo layout expectations) |
| `.cursor/skills/*/SKILL.md` | Workflows, routing, domain knowledge, and links to deeper reference |

Assistants should treat **rules as non-negotiable** and **skills as the playbook** for Chonky-specific tasks (requirements, `machine:assert`, CLI, plugins, specs).

## Skill suite design (information architecture)

The suite uses **one primary skill plus progressive disclosure**:

1. **`SKILL.md`** — Short role statement, a **routing table** (which `reference-*.md` to open for which intent), non-negotiable pointers to rules, minimal workflows, and a compact checklist.
2. **`reference-*.md`** — Deeper tables and examples, each focused on one concern (monorepo, authoring, CLI/build, spec index). Links to `docs/` use relative paths from the skill directory so they resolve in the IDE.

Optional future extension (not required today): split additional **narrow** skills (for example `chonky-cli` only) if automatic skill selection needs finer triggers. The current layout keeps maintenance cost low.

## Installation — for humans

### Using skills inside this repository

If you cloned **this** monorepo and open it in Cursor, the `.cursor/skills/` directory is already present. Enable **project** skills in Cursor settings (and “include third-party / project plugins and skills” if your UI exposes that toggle) so the agent can load them.

### Reusing skills in another repository

1. Copy the entire folder `.cursor/skills/chonky-development/` into your target project at the same path:  
   `<your-project>/.cursor/skills/chonky-development/`
2. Ensure your editor loads **project** skills for that workspace.
3. Adjust or duplicate **rules** if needed: Chonky’s skill text assumes Yarn 4 and this monorepo’s policies when you are working **inside** Chonky; consumer projects may need their own `.cursor/rules` for dependency policy.

Relative links inside the skill (for example to `../../../docs/...`) are computed from the skill file location. They resolve correctly when the skill folder lives under **this** repository’s `.cursor/skills/chonky-development/`. If you copy only the skill into another repo, those links will point to paths that **do not exist** there unless you also vendor the `docs/` tree or replace links with your project’s documentation.

## Usage — for humans

- **Automatic selection**: The YAML `description` on `SKILL.md` lists trigger terms; the agent may apply the skill when the task matches.
- **Manual emphasis**: When starting a large Chonky task, explicitly mention “follow the Chonky project skill” or attach `.cursor/skills/chonky-development/SKILL.md` so the assistant reads the routing table first.

Exact chat commands (`/skill`, and so on) depend on your Cursor version; prefer explicit `@`-style file references if automatic selection is unclear.

## Instructions — for AI models

**Read order**

1. Match the user task against the skill **`description`** in `SKILL.md` frontmatter.
2. Read **`SKILL.md`** body: routing table, non-negotiables, minimal workflows, checklist.
3. Open **only** the `reference-*.md` files that match the task (monorepo vs authoring vs CLI vs spec index).
4. For protocol details, follow links from `reference-specs-index.md` into `docs/spec-*.md`.

**Path resolution**

Skill files live at:

`.cursor/skills/chonky-development/<file>.md`

Repository documentation is under `docs/` at the repository root. From that skill directory, spec links use **`../../../docs/...`** (three levels up to the repo root). Rules are under `.cursor/rules/` and use **`../../rules/...`** from the skill directory.

**Verification commands (this monorepo)**

- `yarn install` — install dependencies  
- `yarn build` — build all workspace packages  
- `yarn test` — run Vitest (including e2e when configured)

Prefer these after changing packages, transpiler output, or generated tests.

## Catalog

| Name | Path | Purpose |
|------|------|---------|
| `chonky-development` | `.cursor/skills/chonky-development/SKILL.md` | Primary skill: routing, workflows, checklist |
| Monorepo reference | `.cursor/skills/chonky-development/reference-monorepo.md` | Yarn 4, workspaces, packages, link to `docs/project-structure.md` |
| Authoring reference | `.cursor/skills/chonky-development/reference-authoring.md` | `defineRequirement`, `machine:assert`, examples |
| CLI and build reference | `.cursor/skills/chonky-development/reference-cli-and-build.md` | `chonky` CLI, `chonky.config.js`, plugins, ambiguity paths |
| Spec index | `.cursor/skills/chonky-development/reference-specs-index.md` | Table of links to `docs/spec-*.md` and roadmap |

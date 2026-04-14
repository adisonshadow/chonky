# Contributing to Chonky

Thank you for your interest in improving Chonky (胖蜜蜂). This document is **English-only**; localized copies are not maintained here.

## Principles

Chonky is a **machine-first** language and toolchain: contributions should preserve **unambiguous syntax**, **explicit structure**, and **clear contracts** for tools and agents. When in doubt, prefer clarity for compilers and automation over “clever” shortcuts that are hard to analyze statically.

## Ways to contribute

- **Design & feedback** — Open a thread in [GitHub Discussions](https://github.com/adisonshadow/chonky/discussions) for language semantics, ergonomics, or roadmap topics before large changes.
- **Bugs** — Use [Issues](https://github.com/adisonshadow/chonky/issues) with a minimal reproduction, expected vs actual behavior, and your environment (Node version, bundler, OS).
- **Features** — Propose the behavior and migration impact first (issue or discussion). Breaking changes need a clear upgrade path or deprecation window.
- **Documentation & examples** — Corrections, tutorials, and requirement/assertion examples are welcome; keep them consistent with the current design in `docs/`.

## Pull requests

1. **One concern per PR** — Easier to review and to bisect if something regresses.
2. **Link context** — Reference the issue or discussion number in the PR description.
3. **Tests** — Add or update tests for behavior changes (transpiler, CLI, runtime). If tests are not yet wired up for a package, state that in the PR and describe how you verified the change.
4. **Style** — Match existing code: formatting, naming, and import style in the touched files. Run the project’s formatter/linter if configured.
5. **Scope** — Avoid unrelated refactors or drive-by renames in the same PR as a feature fix.

## Commits

Use clear, imperative subject lines (e.g. `fix(cli): handle missing config`). Bodies are welcome for non-obvious rationale.

## Security

Do not report security issues in public issues. Use the repository’s **Security** tab or the maintainers’ private disclosure channel if one is published there.

## Community

Stay respectful and assume good intent. Disagreement about design is expected; keep feedback specific and actionable.

---

Thank you for helping shape how humans and AI build software together.

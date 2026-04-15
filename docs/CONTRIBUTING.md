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

## Publishing to npm (maintainers)

1. **Yarn 4 does not reuse `npm login` for `yarn npm publish`.** Use **`yarn npm login`** from the monorepo root, or put a single-line npm token in **`.npm-auth-token`** (gitignored). The `yarn release:*` scripts read that file and set **`YARN_NPM_AUTH_TOKEN`** for the command (see [Yarn `npmAuthToken`](https://yarnpkg.com/configuration/yarnrc#npmAuthToken)). Alternatively `yarn config set npmAuthToken "…" --home` (do not commit secrets).
2. If publish fails with **YN0033**, no token reached the registry. If it fails with **YN0035** (*Two-factor authentication or granular access token with bypass 2fa…*), npm is rejecting the **publish** request: the token npm sees is not allowed to publish (wrong token, read-only token, missing **Bypass 2FA** on the granular token, or token not permitted for `@chonkylang/*`). A **404** on `PUT …/@chonkylang%2f…` often still means **auth/scope** (npm may hide details). **Checklist:** (a) Put the token on **the first line only** of `.npm-auth-token` (a second line must not be merged into the token). (b) Run `yarn config unset npmAuthToken --home` if you once stored an old token. (c) Confirm the granular token has **Read and write** (publish) and **Bypass two-factor authentication** where required. (d) Verify the token with curl (**do not** use `VAR=value curl … Bearer $VAR` on one line—the variable is expanded before `VAR` applies; put the token inside the header with command substitution, or `export` first): `curl -s -H "Authorization: Bearer $(head -n 1 .npm-auth-token | tr -d '\r\n')" https://registry.npmjs.org/-/whoami` (should print your npm username as plain text). See [npm 2FA / token policy](https://docs.npmjs.com/about-two-factor-authentication).
3. The **`@chonkylang`** npm scope (organization) must exist under the publishing account on [npmjs.com](https://www.npmjs.com/), and your token must have publish access to it.
4. From the monorepo root: `yarn release:dry-run` then `yarn release:publish`. Yarn rewrites `workspace:*` dependencies to concrete versions in the published tarballs. Packages publish in topological order. For **`./publish.sh`**, the script exports `YARN_NPM_AUTH_TOKEN` then runs **`yarn release:publish:env`** (same build + publish graph, without a nested shell re-reading the token) to avoid Yarn opening device login when a home-level token/session conflicts. If **`PUT …/@chonkylang%2f…` returns 404**, create the **`chonkylang`** npm organization (or obtain publish rights on it); a valid `/-/whoami` alone does not grant that scope.
5. Each workspace runs `prepublishOnly` to rebuild `dist/` before pack.

## Security

Do not report security issues in public issues. Use the repository’s **Security** tab or the maintainers’ private disclosure channel if one is published there.

## Community

Stay respectful and assume good intent. Disagreement about design is expected; keep feedback specific and actionable.

---

Thank you for helping shape how humans and AI build software together.

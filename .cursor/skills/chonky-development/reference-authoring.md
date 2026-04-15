# Requirement authoring reference

Use this file when editing `defineRequirement`, `machine:assert`, requirement IDs, or generated tests.

## `defineRequirement`

- Import from `@chonkylang/runtime` (runtime is a no-op in the browser; manifests are emitted at build time).
- Use a stable requirement ID matching `REQ-<MODULE>-<SEQ>`. See [spec-structured-requirement-definition.md](../../../docs/spec-structured-requirement-definition.md).
- Keep **`id`**, **`triggers`**, and other fields as plain serializable data in the object literal (JSON-serializable shapes).

```ts
import { defineRequirement } from '@chonkylang/runtime';

export const myReq = defineRequirement({
  id: 'REQ-EXAMPLE-01',
  name: 'Example',
  triggers: [{ type: 'UI_EVENT', target: 'Button#go', event: 'click' }],
});
```

Build output includes `.chonky/requirements/<ID>.json` and an index under `.chonky/requirements/`.

## `machine:assert`

Write scenarios in source; the preprocessor lowers them to `__chonky_assert__` for the Babel plugin:

```ts
machine:assert for "REQ-EXAMPLE-01" {
  scenario("Happy path", () => {
    expect(true).toBe(true);
  });
}
```

Generated tests typically land beside the file under `__tests__/<REQ-ID>.test.ts` and import from `@chonkylang/runtime/test` (Vitest re-exports).

Verification semantics: [spec-verification-engine.md](../../../docs/spec-verification-engine.md).

## Comments and copy

- **All code comments must be English** (including `//`, block, and doc comments). User-visible UI strings may be localized.
- Follow this in every edit; do not rely on IDE rules alone.

## Example application

A working reference app: [examples/todomvc](../../../examples/todomvc) (`chonky.config.js`, `pm-requirement.json`, requirements, and `machine:assert` samples).

## Ambiguity policy (authoring impact)

When adding imports, components, or APIs, respect **`pm-requirement.json`** (exclusions and patterns). See [spec-ambiguity-resolution-protocol.md](../../../docs/spec-ambiguity-resolution-protocol.md).

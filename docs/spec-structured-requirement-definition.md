# Chonky Structured Requirement Definition v1.1

**Document version:** v1.1  
**Published:** 2026-04-16  
**Status:** Current  
**Milestone:** 1.1 — Core specifications and API freeze

---

## 1. Overview

This specification defines **structured requirements** in Chonky: syntax, field constraints, and compile behavior. `defineRequirement()` is the core mechanism for declaring feature intent in a JSON-schema-like shape instead of informal comments. In `.req.ts` files, developers (or AI agents) declare logic; the Babel plugin lowers calls to plain exported objects at build time and emits JSON manifests under `.chonky/requirements/` for agents and tools.

---

## 2. Glossary

| Term | Meaning |
| :--- | :--- |
| **Requirement definition** | Object passed to `defineRequirement()` |
| **Requirement ID** | Globally unique id: `REQ-<MODULE>-<SEQ>` |
| **Manifest** | JSON file under `.chonky/requirements/` emitted at build time |
| **Trigger** | Structured description of what starts the requirement |
| **Requirement provenance (`origin`)** | Optional: whether the requirement was driven by the user or primarily by AI |
| **Implementation status** | Optional development progress for the implementation |
| **Verification status** | Optional progress for tests / `machine:assert` |

---

## 3. File conventions

### 3.1 Naming

Requirement files use the `.req.ts` suffix:

```
<RequirementName>.req.ts
```

Examples: `UserLogin.req.ts`, `ProductSearch.req.ts`

### 3.2 Placement

Place files next to the feature they describe. Recommended layout:

```
src/
├── features/
│   ├── auth/
│   │   ├── UserLogin.req.ts
│   │   └── UserLogout.req.ts
│   └── product/
│       └── ProductSearch.req.ts
```

Alternatively, a top-level `requirements/` folder is allowed:

```
src/
├── requirements/
│   ├── UserLogin.req.ts
│   └── ProductSearch.req.ts
```

### 3.3 One requirement per file

Each `.req.ts` file **must** use `export default` with exactly one `defineRequirement()` call.

---

## 4. `defineRequirement()` signature

```typescript
function defineRequirement(definition: RequirementDefinition): RequirementDefinition;
```

At runtime the function is an identity (returns the input). Its role is compile-time: the Babel plugin recognizes the call site.

### 4.1 `RequirementDefinition`

```typescript
interface RequirementDefinition {
  id: string;
  name?: string;
  description?: string;
  triggers: Trigger[];
  preconditions?: Condition[];
  postconditions?: Condition[];
  sideEffects?: SideEffect[];
  priority?: number;
  dependsOn?: string[];

  /**
   * Who originated this requirement (optional).
   * Used in agent / review flows for change approval.
   */
  origin?: RequirementOrigin;

  /**
   * Development-side progress (optional).
   * Tooling may aggregate completion metrics.
   */
  implementationStatus?: ImplementationStatus;

  /**
   * Test / machine:assert progress (optional).
   * May diverge from implementation (e.g. implemented but tests failing).
   */
  verificationStatus?: VerificationStatus;

  metadata?: Record<string, unknown>;
}
```

#### 4.1.1 `RequirementOrigin`

```typescript
type RequirementOrigin =
  | "USER"      // User-driven: written by the user, or drafted by AI and adopted by the user
  | "AI"        // AI-proposed: added or rewritten by an agent without an explicit user request
  | "UNKNOWN"; // Unspecified or legacy data; consumers must not assume AI
```

Semantics:

- **`USER`:** Product intent comes from the user (including natural-language prompts that produce a draft the user accepts). Prompt-only generation **does not** automatically map to `AI`.  
- **`AI`:** The agent adds, splits, or rewrites a requirement without the user asking for that specific change, and the user has not yet explicitly adopted it (e.g. merge PR, flip to `USER` in a manifest).  
- **`UNKNOWN`:** Field omitted → may serialize as `UNKNOWN` or omit the key; consumers must not treat as `AI` by default.  

**Normative guidance for agents (not necessarily compiler-enforced):** When `origin === "USER"`, agents **should** confirm with the user (or produce an explicit approval task) before **material** edits to `description`, `triggers`, `preconditions`, `postconditions`, `sideEffects`, or `dependsOn` that change observable behavior or acceptance criteria. For `AI` or `UNKNOWN`, documenting breaking changes is still recommended; the same bar of human confirmation as `USER` is not required by this spec.

#### 4.1.2 `ImplementationStatus`

```typescript
type ImplementationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "BLOCKED"
  | "DEFERRED";
```

#### 4.1.3 `VerificationStatus`

```typescript
type VerificationStatus =
  | "NOT_STARTED"
  | "TESTS_WRITTEN"
  | "PASSING"
  | "FAILING"
  | "SKIPPED"
  | "NOT_APPLICABLE";
```

### 4.2 `Trigger`

```typescript
interface Trigger {
  type: TriggerType;
  target: string;
  event: string;
  guard?: string;
}

type TriggerType =
  | "UI_EVENT"
  | "ROUTE_CHANGE"
  | "API_RESPONSE"
  | "TIMER"
  | "STATE_CHANGE"
  | "LIFECYCLE"
  | "CUSTOM";
```

### 4.3 `Condition`

```typescript
interface Condition {
  expression: string;
  type: "STATE_CHECK" | "AUTH_CHECK" | "DATA_VALID" | "CUSTOM";
}
```

### 4.4 `SideEffect`

```typescript
interface SideEffect {
  type: "API_CALL" | "STATE_MUTATION" | "NAVIGATION" | "STORAGE" | "NOTIFICATION" | "CUSTOM";
  target: string;
  description?: string;
}
```

---

## 5. Requirement ID rules

### 5.1 Format

```
REQ-<MODULE>-<SEQ>
```

| Part | Rule | Example |
| :--- | :--- | :--- |
| `REQ` | Fixed prefix, uppercase | `REQ` |
| `<MODULE>` | Uppercase module name, letters and hyphens | `USER-LOGIN`, `PRODUCT` |
| `<SEQ>` | Two or more digits | `01`, `12` |

### 5.2 Uniqueness

- `id` **must** be unique across all `.req.ts` files in a project.  
- Duplicate ids → **compile error**, build stops.  

### 5.3 Valid examples

```
REQ-USER-LOGIN-01
REQ-USER-LOGOUT-01
REQ-PRODUCT-SEARCH-01
REQ-CART-CHECKOUT-03
```

---

## 6. Compile behavior

### 6.1 Pipeline

```
.req.ts source
    │
    ▼
@chonkylang/babel-plugin finds defineRequirement()
    │
    ├──▶ Output 1: lowered JS — unwrap call, export plain object
    │
    └──▶ Output 2: JSON manifest — .chonky/requirements/<ID>.json
```

### 6.2 Lowered code

The plugin replaces `defineRequirement({...})` with `{...}`.

**Source:**

```typescript
// UserLogin.req.ts
export default defineRequirement({
  id: "REQ-USER-LOGIN-01",
  triggers: [
    { type: "UI_EVENT", target: "LoginButton", event: "click" }
  ],
  preconditions: [
    { expression: "user.isLoggedIn === false", type: "STATE_CHECK" }
  ],
  postconditions: [
    { expression: "user.isLoggedIn === true", type: "STATE_CHECK" }
  ],
  sideEffects: [
    { type: "API_CALL", target: "/api/auth/login" },
    { type: "STATE_MUTATION", target: "user.session" },
    { type: "NAVIGATION", target: "/dashboard" }
  ]
});
```

**Output:**

```javascript
// UserLogin.req.js
export default {
  id: "REQ-USER-LOGIN-01",
  triggers: [
    { type: "UI_EVENT", target: "LoginButton", event: "click" }
  ],
  preconditions: [
    { expression: "user.isLoggedIn === false", type: "STATE_CHECK" }
  ],
  postconditions: [
    { expression: "user.isLoggedIn === true", type: "STATE_CHECK" }
  ],
  sideEffects: [
    { type: "API_CALL", target: "/api/auth/login" },
    { type: "STATE_MUTATION", target: "user.session" },
    { type: "NAVIGATION", target: "/dashboard" }
  ]
};
```

### 6.3 JSON manifest

Path: `.chonky/requirements/REQ-USER-LOGIN-01.json`

```json
{
  "id": "REQ-USER-LOGIN-01",
  "sourceFile": "src/features/auth/UserLogin.req.ts",
  "origin": "USER",
  "implementationStatus": "IMPLEMENTED",
  "verificationStatus": "PASSING",
  "triggers": [
    { "type": "UI_EVENT", "target": "LoginButton", "event": "click" }
  ],
  "preconditions": [
    { "expression": "user.isLoggedIn === false", "type": "STATE_CHECK" }
  ],
  "postconditions": [
    { "expression": "user.isLoggedIn === true", "type": "STATE_CHECK" }
  ],
  "sideEffects": [
    { "type": "API_CALL", "target": "/api/auth/login" },
    { "type": "STATE_MUTATION", "target": "user.session" },
    { "type": "NAVIGATION", "target": "/dashboard" }
  ],
  "_chonky": {
    "version": "1.0",
    "generatedAt": "2026-04-14T10:00:00.000Z"
  }
}
```

Extra manifest fields:

| Field | Meaning |
| :--- | :--- |
| `sourceFile` | Relative path to the `.req.ts` |
| `_chonky.version` | Manifest format version |
| `_chonky.generatedAt` | ISO 8601 generation time |

If `origin`, `implementationStatus`, or `verificationStatus` appear in the source object, they **must** be copied into the per-requirement JSON for offline tools and CLI aggregation.

### 6.3.1 Tooling metrics (computed)

These metrics are **derived** by consumers from `.chonky/requirements/*.json` (and optional `index.json`); the plugin need not emit separate rollup files:

| Metric | Suggested definition |
| :--- | :--- |
| **Implementation completion** | Count with `implementationStatus === "IMPLEMENTED"` ÷ total counted (may exclude `DEFERRED`) |
| **Verification pass rate** | Count with `verificationStatus === "PASSING"` ÷ requirements that require verification (may exclude `NOT_APPLICABLE`, `SKIPPED`) |
| **Overall readiness** | Project-defined weighting, e.g. “implemented and passing” |

CLI / CI should read manifests and emit tables, JSON, or exit codes for gates and reports. **Exact subcommand names and output shapes are versioned with the CLI;** this spec only locks field semantics and manifest shape.

### 6.3.2 Requirement search (CLI)

To help humans and **LLM agents** locate requirements, the CLI **should** expose search over compiled manifests. Reference behavior:

| Usage | Behavior |
| :--- | :--- |
| `chonky requirements search <term> [term...]` | Multiple terms are **AND** (all must match). Case-insensitive substring match across `id`, `name`, `description`, `sourceFile`, `origin`, status fields, and serialized `triggers` / `preconditions` / `postconditions` / `sideEffects` / `dependsOn` / `metadata`. |
| `chonky requirements search --all` | List all compiled requirements (subject to `--limit`). |
| `chonky requirements search … --json` | Print **one JSON document** to stdout (`projectRoot`, `terms`, `count`, `results[]`, …) for agent parsing; no reliance on terminal colors or tables. |
| `--root <path>` | Project root (default `.`). |

Search requires `.chonky/requirements/*.json` (e.g. from `chonky build` or an app build with the Chonky plugin). If missing or unreadable, the command **should** exit non-zero and explain via stderr or a JSON `error` field.

### 6.4 Index file

When multiple requirements exist, the plugin may emit `.chonky/requirements/index.json`:

```json
{
  "requirements": [
    {
      "id": "REQ-USER-LOGIN-01",
      "sourceFile": "src/features/auth/UserLogin.req.ts",
      "manifestPath": ".chonky/requirements/REQ-USER-LOGIN-01.json"
    },
    {
      "id": "REQ-USER-LOGOUT-01",
      "sourceFile": "src/features/auth/UserLogout.req.ts",
      "manifestPath": ".chonky/requirements/REQ-USER-LOGOUT-01.json"
    }
  ],
  "_chonky": {
    "version": "1.0",
    "generatedAt": "2026-04-14T10:00:00.000Z"
  }
}
```

### 6.5 Compile errors and warnings

| Condition | Behavior |
| :--- | :--- |
| Missing or empty `id` | **Error**, stop |
| `id` not matching `REQ-<MODULE>-<SEQ>` | **Warning** (error in strict mode) |
| Duplicate `id` | **Error**, stop |
| Empty `triggers` | **Warning** |
| Not `export default` | **Error** |
| `origin` not in enum | **Warning** (may error in strict mode) |
| Invalid `implementationStatus` / `verificationStatus` | **Warning** (may error in strict mode) |

---

## 7. Full example: product search

```typescript
// ProductSearch.req.ts
export default defineRequirement({
  id: "REQ-PRODUCT-SEARCH-01",
  name: "Product keyword search",
  description: "After the user submits keywords in the search box, show matching products",
  origin: "USER",
  implementationStatus: "IN_PROGRESS",
  verificationStatus: "TESTS_WRITTEN",
  triggers: [
    { type: "UI_EVENT", target: "SearchInput", event: "submit" },
    { type: "UI_EVENT", target: "SearchButton", event: "click" }
  ],
  preconditions: [
    { expression: "searchQuery.trim().length > 0", type: "DATA_VALID" }
  ],
  postconditions: [
    { expression: "searchResults.length >= 0", type: "STATE_CHECK" },
    { expression: "ui.loading === false", type: "STATE_CHECK" }
  ],
  sideEffects: [
    { type: "API_CALL", target: "/api/products/search" },
    { type: "STATE_MUTATION", target: "searchResults" }
  ],
  priority: 1,
  dependsOn: ["REQ-USER-LOGIN-01"],
  metadata: {
    team: "product",
    sprint: "2026-S08"
  }
});
```

---

## 8. Changelog

| Version | Date | Notes |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | Initial release |
| v1.1 | 2026-04-16 | Optional `origin`, `implementationStatus`, `verificationStatus`; provenance semantics and agent change guidance; manifest passthrough and completion aggregation; `chonky requirements search` semantics |

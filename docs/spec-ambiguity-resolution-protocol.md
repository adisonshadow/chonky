# Chonky Ambiguity Resolution Protocol v1.0

**Document version:** v1.0  
**Published:** 2026-04-14  
**Status:** Initial release  
**Milestone:** 1.1 — Core specifications and API freeze

---

## 1. Overview

This specification defines the Chonky **Ambiguity Resolution Protocol**. In AI-driven code generation, product owners declare components, APIs, or patterns that **must not** appear via the policy manifest `pm-requirement.json`. The Babel plugin performs **bidirectional** checks at compile time: **forward** checks detect forbidden `excluded` items; **reverse** checks detect code that violates `negate` constraints. Together they align generated code with product intent and reduce ambiguous requirements.

---

## 2. Glossary

| Term | Meaning |
| :--- | :--- |
| **Policy manifest** | `pm-requirement.json`, maintained by product or program management |
| **Excluded item** | A component, API, import, or pattern explicitly forbidden in code |
| **Negate constraint** | States behavior a feature **must not** exhibit (negative requirement) |
| **Forward check** | Detects references to excluded items |
| **Reverse check** | Detects code that contradicts a `negate` declaration |
| **Strict mode** | Treats warnings as compile errors |

---

## 3. Policy manifest file

### 3.1 Location and naming

Default path at project root:

```
<project-root>/pm-requirement.json
```

Override in `chonky.config.js`:

```javascript
module.exports = {
  ambiguity: {
    policyManifest: "./config/pm-requirement.json"
  }
};
```

### 3.2 JSON schema (TypeScript)

```typescript
interface PolicyManifest {
  /** Manifest format version */
  version: string;

  /** Product or project identifier */
  projectId?: string;

  /** List of policy rules */
  rules: PolicyRule[];
}

interface PolicyRule {
  /** Unique rule id */
  id: string;

  /** Optional link to a `defineRequirement` id */
  requirementId?: string;

  /** Human-readable description */
  description: string;

  /** Forbidden components / APIs / patterns */
  excluded: ExcludedItem[];

  /** Behaviors that must not appear in scope */
  negate?: NegateConstraint[];

  /** Suggested replacements */
  preferred?: PreferredItem[];

  /** Severity for this rule */
  severity?: "warning" | "error";
}
```

### 3.3 `ExcludedItem`

```typescript
interface ExcludedItem {
  type: "component" | "api" | "import" | "pattern";
  target: string;
  /** Shown in compiler diagnostics */
  reason: string;
}
```

`target` formats:

| `type` | `target` format | Matching |
| :--- | :--- | :--- |
| `component` | Component name, e.g. `"DatePicker"` | JSX tag name |
| `api` | Function or path, e.g. `"fetch"`, `"/api/v1/legacy"` | Call sites or string literals |
| `import` | Package or path, e.g. `"moment"`, `"lodash/merge"` | `import` / `require` |
| `pattern` | Regex string, e.g. `"document\\.cookie"` | Full source text |

### 3.4 `NegateConstraint`

```typescript
interface NegateConstraint {
  id: string;
  behavior: string;
  detection: NegateDetection;
}

interface NegateDetection {
  type: "code_pattern" | "api_call" | "state_mutation" | "dom_operation";
  pattern: string;
  /** Optional file or directory glob limiting the check */
  scope?: string;
}
```

- **`excluded`:** global prohibition — must not appear anywhere.  
- **`negate`:** requirement-scoped — behavior that must not appear within the linked feature / scope.

### 3.5 `PreferredItem`

```typescript
interface PreferredItem {
  replaces: string;
  suggestion: string;
  description?: string;
}
```

---

## 4. Example manifest

```json
{
  "version": "1.0",
  "projectId": "chonky-demo-app",
  "rules": [
    {
      "id": "POLICY-UI-001",
      "requirementId": "REQ-USER-LOGIN-01",
      "description": "Login page must not use third-party date pickers or legacy modal components",
      "excluded": [
        {
          "type": "component",
          "target": "DatePicker",
          "reason": "No date selection in login flow; prevents agents from adding one by mistake"
        },
        {
          "type": "component",
          "target": "LegacyModal",
          "reason": "Deprecated; use Dialog from the design system"
        },
        {
          "type": "import",
          "target": "moment",
          "reason": "Project standard is dayjs"
        }
      ],
      "negate": [
        {
          "id": "NEGATE-001",
          "behavior": "Login must not store plaintext passwords in the client",
          "detection": {
            "type": "code_pattern",
            "pattern": "localStorage\\.setItem\\(['\"]password['\"]",
            "scope": "src/features/auth/**"
          }
        },
        {
          "id": "NEGATE-002",
          "behavior": "Login must not set logged-in state without server verification",
          "detection": {
            "type": "state_mutation",
            "pattern": "user\\.isLoggedIn\\s*=\\s*true",
            "scope": "src/features/auth/**"
          }
        }
      ],
      "preferred": [
        {
          "replaces": "LegacyModal",
          "suggestion": "Dialog",
          "description": "Use Dialog from the design system"
        },
        {
          "replaces": "moment",
          "suggestion": "dayjs",
          "description": "Lightweight date library with moment-like API"
        }
      ],
      "severity": "warning"
    },
    {
      "id": "POLICY-SECURITY-001",
      "description": "Globally forbid direct cookie access and eval",
      "excluded": [
        {
          "type": "pattern",
          "target": "document\\.cookie",
          "reason": "Use the safe cookie wrapper from @chonkylang/runtime"
        },
        {
          "type": "api",
          "target": "eval",
          "reason": "Security risk: eval is forbidden"
        }
      ],
      "severity": "error"
    }
  ]
}
```

---

## 5. Compile-time checks

### 5.1 Flow

```
Compile source
    │
    ▼
Babel plugin loads pm-requirement.json
    │
    ├──▶ Forward: scan for excluded matches
    │        ├── component: JSX opening tags
    │        ├── api: call expressions
    │        ├── import: import / require
    │        └── pattern: regex over source text
    │
    └──▶ Reverse: scan for negate matches
             ├── code_pattern: regex over source
             ├── api_call: call expression text
             ├── state_mutation: assignment text
             └── dom_operation: document.* / window.* member calls
```

### 5.2 Forward rules

For each compiled file, iterate all `rules[].excluded`:

1. **component:** `JSXOpeningElement` name vs `target`  
2. **api:** `CallExpression` callee vs `target`  
3. **import:** `ImportDeclaration` / `require()` source vs `target`  
4. **pattern:** compile `target` as regex, match full file text  

### 5.3 Reverse rules

Run only when the file path matches `negate[].detection.scope` (if `scope` is omitted, apply project-wide):

1. Compile `detection.pattern` as a regex.  
2. By `detection.type`, choose what to match (see §5.1).  
3. A match means the forbidden **behavior** is present.

### 5.4 When checks run

On the Babel plugin’s **`Program:exit`** hook: after the full AST for a file is visited, before codegen. That way:

- All nodes are visible  
- Results are emitted in the same compilation pass  
- Other transforms are not disturbed  

---

## 6. Output behavior

### 6.1 Default (warnings)

Hits emit **warnings** and do not fail the build by default:

```
⚠ [chonky/ambiguity] POLICY-UI-001: Component "DatePicker" is excluded.
  Reason: No date selection in login flow; prevents agents from adding one by mistake
  Preferred: (no alternative specified)
  File: src/features/auth/LoginForm.tsx:15:5

⚠ [chonky/ambiguity] POLICY-UI-001/NEGATE-001: Negate constraint violated.
  Behavior: Login must not store plaintext passwords in the client
  Matched: localStorage.setItem("password", ...)
  File: src/features/auth/LoginService.ts:42:3
```

### 6.2 Strict mode

Global strict mode or per-rule `severity: "error"` turns hits into **errors**:

```javascript
module.exports = {
  ambiguity: {
    strictMode: true
  }
};
```

```
✖ [chonky/ambiguity] POLICY-SECURITY-001: Pattern "document.cookie" is excluded.
  Reason: Use the safe cookie wrapper from @chonkylang/runtime
  File: src/utils/analytics.ts:8:1
  Build aborted.
```

### 6.3 Rule-level `severity`

```json
{
  "id": "POLICY-SECURITY-001",
  "severity": "error",
  "excluded": [...]
}
```

Precedence: `rule.severity` > `config.ambiguity.strictMode` > default `"warning"`.

### 6.4 Report file

After each build, aggregate results may be written to `.chonky/ambiguity-report.json`:

```json
{
  "timestamp": "2026-04-14T10:00:00.000Z",
  "totalViolations": 3,
  "violations": [
    {
      "ruleId": "POLICY-UI-001",
      "type": "excluded",
      "target": "DatePicker",
      "file": "src/features/auth/LoginForm.tsx",
      "line": 15,
      "column": 5,
      "severity": "warning"
    },
    {
      "ruleId": "POLICY-UI-001",
      "constraintId": "NEGATE-001",
      "type": "negate",
      "behavior": "Login must not store plaintext passwords in the client",
      "matchedText": "localStorage.setItem(\"password\", pwd)",
      "file": "src/features/auth/LoginService.ts",
      "line": 42,
      "column": 3,
      "severity": "warning"
    }
  ]
}
```

---

## 7. Interaction with other specs

### 7.1 Structured requirements

`PolicyRule.requirementId` links a rule to a `defineRequirement` id. When set:

- `negate` `scope` may be derived from the requirement’s implementation area  
- Reports can include requirement name and description for traceability  

### 7.2 Verification engine

Ambiguity runs at **compile time**, before tests from `machine:assert` run at **test time**:

- **Ambiguity:** static — no forbidden items, no violated negations  
- **Verification engine:** dynamic — behavior matches positive requirements  

---

## 8. Configuration reference

```javascript
module.exports = {
  ambiguity: {
    policyManifest: "./pm-requirement.json",
    strictMode: false,
    generateReport: true,
    reportPath: ".chonky/ambiguity-report.json",
    ignorePatterns: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "__tests__/**"
    ]
  }
};
```

---

## 9. Changelog

| Version | Date | Notes |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | Initial release |

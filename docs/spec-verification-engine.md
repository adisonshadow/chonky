# Chonky Verification Engine Specification v1.0

**Document version:** v1.0  
**Published:** 2026-04-14  
**Status:** Initial release  
**Milestone:** 1.1 — Core specifications and API freeze

---

## 1. Overview

This specification defines the Chonky **Autonomous Verification Engine**: full syntax for `machine:assert`, compile-time lowering to tests, and requirement-ID binding. `machine:assert` is a Chonky syntax extension that lets developers (or AI agents) bind verification scenarios directly to structured requirement IDs. The Babel plugin lowers each block to Jest/Vitest-compatible tests at build time, closing the loop from requirement definitions to executable assertions.

---

## 2. Glossary

| Term | Meaning |
| :--- | :--- |
| **machine:assert block** | Chonky syntax block declaring verification scenarios for a requirement |
| **Scenario** | A single test scenario inside a `machine:assert` block, corresponding to one `scenario()` call |
| **Requirement ID binding** | The `for "ID"` clause associates the block with an `id` from a `.req.ts` file |
| **Compile target** | Test code emitted by the Babel plugin after lowering `machine:assert` |

---

## 3. Syntax

### 3.1 EBNF

```ebnf
MachineAssertBlock
  = "machine" ":" "assert" "for" RequirementIdLiteral AssertBody ;

RequirementIdLiteral
  = StringLiteral ;                        (* e.g. "REQ-USER-LOGIN-01" *)

AssertBody
  = "{" ScenarioDeclaration+ "}" ;

ScenarioDeclaration
  = "scenario" "(" ScenarioName "," ScenarioFunction ")" ";" ;

ScenarioName
  = StringLiteral ;                        (* e.g. "Password too short" *)

ScenarioFunction
  = ArrowFunction | FunctionExpression ;   (* body containing assertions *)
```

### 3.2 Notes

- `machine:assert` is a **statement-level** extension. It may appear at module top level or at the top level of a function body, not nested inside an expression.
- The string after `for` **must** be a valid requirement ID (format: see *Structured requirement definition*).
- `AssertBody` **must** contain at least one `scenario()` declaration.
- `scenario()` bodies may use any TypeScript/JavaScript, including `async/await`.

### 3.3 Example

```typescript
machine:assert for "REQ-USER-LOGIN-01" {
  scenario("Successful login with valid credentials", async () => {
    const result = await loginService.login("user@example.com", "ValidPass123");
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  scenario("Password too short", async () => {
    const result = await loginService.login("user@example.com", "123");
    expect(result.success).toBe(false);
    expect(result.error).toBe("PASSWORD_TOO_SHORT");
  });

  scenario("Empty email rejected", () => {
    expect(() => loginService.login("", "ValidPass123")).toThrow();
  });
}
```

---

## 4. Compile target mapping

### 4.1 Rules

The Babel plugin emits one test file per requirement ID referenced from a source tree, as follows:

| Source | Output |
| :--- | :--- |
| `machine:assert for "ID" { ... }` | File `__tests__/<ID>.test.ts` (relative to the source file) |
| `scenario("name", fn)` | `test('ID \| name', fn)` |
| `expect(...)` inside the body | Preserved (from `@chonkylang/runtime/test`) |

### 4.2 Output path

```
__tests__/<RequirementID>.test.ts
```

- Path is relative to the directory containing the source file.
- Example: source `src/features/auth/LoginAssert.cts` → `src/features/auth/__tests__/REQ-USER-LOGIN-01.test.ts`.
- If multiple source files contain `machine:assert` for the same ID, all scenarios are merged into one output file.

### 4.3 Example

**Source (`src/features/auth/LoginAssert.cts`):**

```typescript
machine:assert for "REQ-USER-LOGIN-01" {
  scenario("Password too short", async () => {
    const result = await loginService.login("user@example.com", "123");
    expect(result.success).toBe(false);
    expect(result.error).toBe("PASSWORD_TOO_SHORT");
  });

  scenario("Account locked after 5 failures", async () => {
    for (let i = 0; i < 5; i++) {
      await loginService.login("user@example.com", "wrong");
    }
    const result = await loginService.login("user@example.com", "wrong");
    expect(result.error).toBe("ACCOUNT_LOCKED");
  });
}
```

**Output (`src/features/auth/__tests__/REQ-USER-LOGIN-01.test.ts`):**

```typescript
import { test, expect, describe } from '@chonkylang/runtime/test';

describe('REQ-USER-LOGIN-01', () => {
  test('REQ-USER-LOGIN-01 | Password too short', async () => {
    const result = await loginService.login("user@example.com", "123");
    expect(result.success).toBe(false);
    expect(result.error).toBe("PASSWORD_TOO_SHORT");
  });

  test('REQ-USER-LOGIN-01 | Account locked after 5 failures', async () => {
    for (let i = 0; i < 5; i++) {
      await loginService.login("user@example.com", "wrong");
    }
    const result = await loginService.login("user@example.com", "wrong");
    expect(result.error).toBe("ACCOUNT_LOCKED");
  });
});
```

### 4.4 Imports

Generated tests import helpers from `@chonkylang/runtime/test`:

```typescript
import { test, expect, describe, beforeEach, afterEach } from '@chonkylang/runtime/test';
```

That module delegates to the project’s real test runner, detected in order:

1. If `vitest` can be resolved → Vitest  
2. Else if Jest globals exist → Jest  
3. Else → compile-time warning; emitted file may include a header comment explaining the gap  

### 4.5 Generated file header

```typescript
/**
 * @chonkylang-generated
 * @requirement REQ-USER-LOGIN-01
 * @source src/features/auth/LoginAssert.cts
 * @generated-at 2026-04-14T10:00:00.000Z
 *
 * WARNING: This file is auto-generated by @chonkylang/babel-plugin.
 * Do not edit manually. Changes will be overwritten on next build.
 */
```

---

## 5. Requirement ID binding

### 5.1 Traceability

The ID in `machine:assert for "ID"` links **verification scenarios** to **requirement definitions**:

```
.req.ts (defineRequirement)  ←──bound──→  machine:assert (scenarios)
         │                                          │
         ▼                                          ▼
  .chonky/requirements/ID.json              __tests__/ID.test.ts
```

### 5.2 ID consistency checks

When lowering `machine:assert`, the plugin consults compiled `.req.ts` manifests:

| Case | Default | Strict mode |
| :--- | :--- | :--- |
| ID exists in manifest | OK | OK |
| ID missing from manifest | **Warning:** `Assertion references unknown requirement "ID"` | **Error**, build stops |
| Requirement exists but has no assert | **Warning:** `Requirement "ID" has no associated assertions` | **Warning** |

Enable strict binding in `chonky.config.js`:

```javascript
module.exports = {
  verification: {
    strictBinding: true   // unknown ID → compile error
  }
};
```

### 5.3 Cross-file binding

The same requirement ID may appear in **multiple** source files. The compiler merges all scenarios into one test file and may group them by source path inside `describe`:

```typescript
describe('REQ-USER-LOGIN-01', () => {
  describe('[src/features/auth/LoginAssert.cts]', () => {
    test('REQ-USER-LOGIN-01 | Password too short', async () => { /* ... */ });
  });

  describe('[src/features/auth/LoginEdgeCases.cts]', () => {
    test('REQ-USER-LOGIN-01 | Unicode password handling', async () => { /* ... */ });
  });
});
```

---

## 6. `verify()` runtime helper

### 6.1 Signature

```typescript
function verify(requirementId: string, assertion: () => void | Promise<void>): void;
```

### 6.2 Purpose

`verify()` runs checks **at runtime in development** (not only in tests), for example:

- Checking postconditions while the app runs  
- Guards agents can inject  

### 6.3 Behavior

| Environment | Behavior |
| :--- | :--- |
| **Development** | Runs the assertion; on failure logs to `window.__CHONKY_LOGS__` and warns in the console |
| **Test** | Delegates to the test framework’s assertion machinery |
| **Production** | No-op, removed by tree-shaking |

### 6.4 Example

```typescript
import { verify } from '@chonkylang/runtime';

verify("REQ-USER-LOGIN-01", () => {
  const session = getSession();
  if (!session.token) {
    throw new Error("Post-login session must have a token");
  }
});
```

---

## 7. End-to-end example

### Step 1: Define the requirement

```typescript
// src/features/cart/AddToCart.req.ts
export default defineRequirement({
  id: "REQ-CART-ADD-01",
  name: "Add product to cart",
  triggers: [
    { type: "UI_EVENT", target: "AddToCartButton", event: "click" }
  ],
  preconditions: [
    { expression: "product.stock > 0", type: "DATA_VALID" },
    { expression: "user.isLoggedIn === true", type: "AUTH_CHECK" }
  ],
  postconditions: [
    { expression: "cart.items.includes(product.id)", type: "STATE_CHECK" },
    { expression: "cart.totalCount === prevCount + 1", type: "STATE_CHECK" }
  ],
  sideEffects: [
    { type: "API_CALL", target: "/api/cart/add" },
    { type: "STATE_MUTATION", target: "cart.items" }
  ]
});
```

### Step 2: Write scenarios

```typescript
// src/features/cart/CartAssertions.cts
machine:assert for "REQ-CART-ADD-01" {
  scenario("Add in-stock product to empty cart", async () => {
    const cart = createEmptyCart();
    const product = { id: "P001", stock: 10 };
    const result = await cartService.addToCart(cart, product);
    expect(result.cart.items).toContain("P001");
    expect(result.cart.totalCount).toBe(1);
  });

  scenario("Reject adding out-of-stock product", async () => {
    const cart = createEmptyCart();
    const product = { id: "P002", stock: 0 };
    const result = await cartService.addToCart(cart, product);
    expect(result.success).toBe(false);
    expect(result.error).toBe("OUT_OF_STOCK");
  });

  scenario("Reject adding when not logged in", async () => {
    mockAuth({ isLoggedIn: false });
    const cart = createEmptyCart();
    const product = { id: "P001", stock: 10 };
    const result = await cartService.addToCart(cart, product);
    expect(result.success).toBe(false);
    expect(result.error).toBe("AUTH_REQUIRED");
  });
}
```

### Step 3: Generated file

**Path:** `src/features/cart/__tests__/REQ-CART-ADD-01.test.ts`

```typescript
/**
 * @chonkylang-generated
 * @requirement REQ-CART-ADD-01
 * @source src/features/cart/CartAssertions.cts
 * @generated-at 2026-04-14T10:00:00.000Z
 *
 * WARNING: This file is auto-generated by @chonkylang/babel-plugin.
 * Do not edit manually. Changes will be overwritten on next build.
 */
import { test, expect, describe } from '@chonkylang/runtime/test';

describe('REQ-CART-ADD-01', () => {
  test('REQ-CART-ADD-01 | Add in-stock product to empty cart', async () => {
    const cart = createEmptyCart();
    const product = { id: "P001", stock: 10 };
    const result = await cartService.addToCart(cart, product);
    expect(result.cart.items).toContain("P001");
    expect(result.cart.totalCount).toBe(1);
  });

  test('REQ-CART-ADD-01 | Reject adding out-of-stock product', async () => {
    const cart = createEmptyCart();
    const product = { id: "P002", stock: 0 };
    const result = await cartService.addToCart(cart, product);
    expect(result.success).toBe(false);
    expect(result.error).toBe("OUT_OF_STOCK");
  });

  test('REQ-CART-ADD-01 | Reject adding when not logged in', async () => {
    mockAuth({ isLoggedIn: false });
    const cart = createEmptyCart();
    const product = { id: "P001", stock: 10 };
    const result = await cartService.addToCart(cart, product);
    expect(result.success).toBe(false);
    expect(result.error).toBe("AUTH_REQUIRED");
  });
});
```

### Step 4: Run tests

```bash
chonky test
# or invoke the project runner directly
npx vitest run __tests__/REQ-CART-ADD-01.test.ts
```

---

## 8. Errors and warnings

| Condition | Default | Strict mode |
| :--- | :--- | :--- |
| `machine:assert` without `for` | **Error** | **Error** |
| `for` string not a valid requirement ID format | **Warning** | **Error** |
| No `scenario()` in body | **Error** | **Error** |
| ID not defined in any `.req.ts` | **Warning** | **Error** |
| Duplicate same ID + same scenario name | **Warning** (last wins on merge) | **Error** |

---

## 9. Changelog

| Version | Date | Notes |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | Initial release |

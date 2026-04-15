# Chonky Render Metadata Protocol v1.0

**Document version:** v1.0  
**Published:** 2026-04-14  
**Status:** Initial release  
**Milestone:** 1.1 — Core specifications and API freeze

---

## 1. Overview

This specification defines the Chonky **Render Metadata Protocol**: data shapes, injection, lifecycle collection, and query APIs. At build time JSX is wrapped so that, in development, the runtime records render information into `window.__CHONKY_RENDER_META__` for AI-assisted debugging, DevTools visualization, and render analysis.

---

## 2. Glossary

| Term | Meaning |
| :--- | :--- |
| **Render metadata** | Structured data collected on each mount / update / unmount |
| **Chonky wrapper** | `_ChonkyWrapper`, a HOC injected by the Babel plugin to observe renders |
| **Chonky ID** | Stable per-element id assigned at compile time |
| **ChonkyRenderer** | Class from `@chonkylang/runtime` that stores and queries metadata |
| **DevTools panel** | Browser extension that consumes metadata for UI |

---

## 3. Core data structures

### 3.1 Global: `window.__CHONKY_RENDER_META__`

```typescript
interface ChonkyRenderMeta {
  components: Record<string, ComponentEntry>;
  events: RenderEvent[];
  tree: ComponentTreeNode | null;
  version: string;
}
```

### 3.2 `ComponentEntry`

```typescript
interface ComponentEntry {
  chonkyId: string;
  componentName: string;
  sourceFile: string;
  sourceLine: number;
  instances: ComponentInstance[];
}
```

### 3.3 `ComponentInstance`

```typescript
interface ComponentInstance {
  instanceId: string;
  parentChonkyId: string | null;
  currentProps: Record<string, unknown>;
  lastRenderAt: number;
  renderCount: number;
  status: "mounted" | "unmounted";
}
```

### 3.4 `RenderEvent`

```typescript
interface RenderEvent {
  type: "mount" | "update" | "unmount";
  chonkyId: string;
  instanceId: string;
  timestamp: number;
  props: Record<string, unknown>;
  changedProps?: string[];
  duration?: number;
}
```

### 3.5 `ComponentTreeNode`

```typescript
interface ComponentTreeNode {
  chonkyId: string;
  componentName: string;
  instanceId: string;
  props: Record<string, unknown>;
  children: ComponentTreeNode[];
}
```

---

## 4. Injection

### 4.1 Babel transform

`@chonkylang/babel-plugin` wraps JSX elements in development.

**Source:**

```tsx
<Button onClick={handleSubmit}>Submit</Button>
```

**Development output:**

```tsx
<_ChonkyWrapper
  __chonkyId="btn_a1b2c3"
  __componentName="Button"
  __sourceFile="src/features/auth/LoginForm.tsx"
  __sourceLine={42}
>
  <Button onClick={handleSubmit}>Submit</Button>
</_ChonkyWrapper>
```

### 4.2 Chonky ID format

Deterministic at compile time:

```
<componentNameAbbrev>_<hash6>
```

- `componentNameAbbrev`: first 3–6 lowercase characters of the component name  
- `hash6`: hex hash from `sourceFile + sourceLine + componentName`  

Examples: `btn_a1b2c3`, `input_f4e5d6`, `modal_1a2b3c`

### 4.3 Internal props on `_ChonkyWrapper`

| Prop | Type | Role |
| :--- | :--- | :--- |
| `__chonkyId` | `string` | Stable id |
| `__componentName` | `string` | Component name |
| `__sourceFile` | `string` | Relative source path |
| `__sourceLine` | `number` | Source line |

### 4.4 DOM attribute

The wrapper sets `data-chonky-id` on the wrapped root DOM node:

```html
<button data-chonky-id="btn_a1b2c3" class="submit-btn">Submit</button>
```

### 4.5 Environment split

| Environment | Behavior |
| :--- | :--- |
| **Development** (`NODE_ENV=development`) | Full `_ChonkyWrapper` injection and collection |
| **Production** (`NODE_ENV=production`) | No wrapper; runtime collection tree-shaken away |

Zero production overhead by design.

---

## 5. Lifecycle collection

### 5.1 Mount

On first render (`useEffect` initial run):

1. Allocate `instanceId` (short UUID v4)  
2. Register under `components[chonkyId].instances`  
3. Append `RenderEvent { type: "mount", ... }`  
4. Refresh tree snapshot  

### 5.2 Update

On prop-driven re-render:

1. Diff props → `changedProps`  
2. Update `currentProps`, `lastRenderAt`, increment `renderCount`  
3. Append `RenderEvent { type: "update", changedProps, duration }`  

### 5.3 Unmount

On cleanup:

1. Set `status` to `"unmounted"`  
2. Append `RenderEvent { type: "unmount", props: lastProps }`  
3. Remove node from tree snapshot  

### 5.4 Event ring buffer

`events` is bounded (default **2000** entries); oldest dropped on overflow. Adjust with `ChonkyRenderer.setEventBufferSize(n)`.

---

## 6. `ChonkyRenderer` API

Exported singleton from `@chonkylang/runtime`.

### 6.1 Component queries

```typescript
class ChonkyRenderer {
  getComponentTree(): ComponentTreeNode | null;
  queryByName(componentName: string): ComponentInstance[];
  getComponent(chonkyId: string): ComponentEntry | null;
  getInstances(chonkyId: string): ComponentInstance[];
}
```

### 6.2 Event queries

```typescript
class ChonkyRenderer {
  getEvents(chonkyId: string): RenderEvent[];
  getEventsByTimeRange(startMs: number, endMs: number): RenderEvent[];
  getHotComponents(topN: number): Array<{ chonkyId: string; renderCount: number }>;
}
```

### 6.3 Export and reset

```typescript
class ChonkyRenderer {
  export(): ChonkyRenderMeta;
  reset(): void;
  setEventBufferSize(size: number): void;
}
```

---

## 7. DevTools messaging

### 7.1 Runtime → panel

```typescript
window.postMessage({
  source: "chonky-runtime",
  type: "RENDER_EVENT",
  payload: renderEvent
}, "*");
```

### 7.2 Message types

| `type` | When | `payload` |
| :--- | :--- | :--- |
| `RENDER_EVENT` | Each mount/update/unmount | `RenderEvent` |
| `TREE_SNAPSHOT` | Tree structure changed | `ComponentTreeNode` |
| `FULL_SYNC` | Panel connects or requests sync | `ChonkyRenderMeta` |

### 7.3 Panel → runtime

```typescript
window.postMessage({
  source: "chonky-devtools",
  type: "REQUEST_FULL_SYNC"
}, "*");
```

---

## 8. Full example

### 8.1 Source

```tsx
// src/features/auth/LoginForm.tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  return (
    <form>
      <Input value={email} onChange={setEmail} placeholder="Email address" />
      <Button onClick={handleLogin}>Log in</Button>
    </form>
  );
}
```

### 8.2 Development compile output (conceptual)

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  return (
    <_ChonkyWrapper __chonkyId="form_c8d9e0" __componentName="form" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={4}>
      <form>
        <_ChonkyWrapper __chonkyId="input_a1b2c3" __componentName="Input" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={5}>
          <Input value={email} onChange={setEmail} placeholder="Email address" />
        </_ChonkyWrapper>
        <_ChonkyWrapper __chonkyId="btn_d4e5f6" __componentName="Button" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={6}>
          <Button onClick={handleLogin}>Log in</Button>
        </_ChonkyWrapper>
      </form>
    </_ChonkyWrapper>
  );
}
```

### 8.3 Sample `__CHONKY_RENDER_META__`

```json
{
  "version": "1.0",
  "components": {
    "btn_d4e5f6": {
      "chonkyId": "btn_d4e5f6",
      "componentName": "Button",
      "sourceFile": "src/features/auth/LoginForm.tsx",
      "sourceLine": 6,
      "instances": [
        {
          "instanceId": "i_7f8a9b",
          "parentChonkyId": "form_c8d9e0",
          "currentProps": { "onClick": "[Function]", "children": "Log in" },
          "lastRenderAt": 1713081600000,
          "renderCount": 1,
          "status": "mounted"
        }
      ]
    }
  },
  "events": [
    {
      "type": "mount",
      "chonkyId": "btn_d4e5f6",
      "instanceId": "i_7f8a9b",
      "timestamp": 1713081600000,
      "props": { "onClick": "[Function]", "children": "Log in" },
      "duration": 2
    }
  ],
  "tree": {
    "chonkyId": "form_c8d9e0",
    "componentName": "form",
    "instanceId": "i_3c4d5e",
    "props": {},
    "children": [
      {
        "chonkyId": "input_a1b2c3",
        "componentName": "Input",
        "instanceId": "i_6e7f8a",
        "props": { "value": "", "placeholder": "Email address" },
        "children": []
      },
      {
        "chonkyId": "btn_d4e5f6",
        "componentName": "Button",
        "instanceId": "i_7f8a9b",
        "props": { "children": "Log in" },
        "children": []
      }
    ]
  }
}
```

---

## 9. Changelog

| Version | Date | Notes |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | Initial release |

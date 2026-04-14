# Chonky 结构化需求定义规范 v1.0

**文档版本：** v1.0  
**发布日期：** 2026-04-14  
**文档状态：** 初始发布  
**所属里程碑：** 1.1 — 核心规范与接口文档冻结

---

## 一、概述

本规范定义了 Chonky 语言中 **结构化需求定义** 的完整语法、字段约束和编译行为。`defineRequirement()` 是 Chonky 取代自然语言注释描述功能需求的核心机制：开发者（或 AI Agent）在 `.req.ts` 文件中以 JSON-Schema 风格声明功能逻辑，Babel 插件在构建阶段将其转换为标准 JS 对象导出，同时生成独立的 JSON 清单文件供 AI Agent 读取。

---

## 二、术语表

| 术语 | 含义 |
| :--- | :--- |
| **需求定义 (Requirement Definition)** | 使用 `defineRequirement()` 声明的结构化功能描述对象 |
| **需求 ID (Requirement ID)** | 全局唯一的需求标识符，格式为 `REQ-<MODULE>-<SEQ>` |
| **清单文件 (Manifest)** | 编译时由 Babel 插件输出到 `.chonky/requirements/` 的 JSON 文件 |
| **触发器 (Trigger)** | 描述何种事件启动该需求逻辑的结构化对象 |

---

## 三、文件约定

### 3.1 文件命名

需求定义文件使用 `.req.ts` 后缀：

```
<RequirementName>.req.ts
```

示例：`UserLogin.req.ts`、`ProductSearch.req.ts`

### 3.2 文件放置

需求定义文件应放置在与其所描述功能模块同级或邻近的目录中。推荐的组织方式：

```
src/
├── features/
│   ├── auth/
│   │   ├── UserLogin.req.ts
│   │   └── UserLogout.req.ts
│   └── product/
│       └── ProductSearch.req.ts
```

也允许统一放置在顶层 `requirements/` 目录中：

```
src/
├── requirements/
│   ├── UserLogin.req.ts
│   └── ProductSearch.req.ts
```

### 3.3 每文件一个需求

每个 `.req.ts` 文件 **必须** 使用 `export default` 导出一个 `defineRequirement()` 调用，且仅包含一个需求定义。

---

## 四、`defineRequirement()` 函数签名

```typescript
function defineRequirement(definition: RequirementDefinition): RequirementDefinition;
```

该函数在运行时是一个恒等函数（原样返回传入对象）。其核心作用在编译阶段：作为 Babel 插件识别需求定义节点的标记函数。

### 4.1 `RequirementDefinition` 完整类型定义

```typescript
interface RequirementDefinition {
  /** 全局唯一需求标识符 */
  id: string;

  /** 需求的人类可读名称（用于报告与 DevTools 展示） */
  name?: string;

  /** 需求简述 */
  description?: string;

  /** 触发条件列表 */
  triggers: Trigger[];

  /** 前置条件：执行此需求前必须满足的状态 */
  preconditions?: Condition[];

  /** 后置条件：此需求执行完毕后应达到的状态 */
  postconditions?: Condition[];

  /** 副作用声明：此需求执行时产生的外部影响 */
  sideEffects?: SideEffect[];

  /** 优先级（数字越小优先级越高，默认 0） */
  priority?: number;

  /** 关联的需求 ID 列表 */
  dependsOn?: string[];

  /** 自定义元数据，供 Agent 或工具链扩展使用 */
  metadata?: Record<string, unknown>;
}
```

### 4.2 `Trigger` 类型定义

```typescript
interface Trigger {
  /** 触发器类型 */
  type: TriggerType;

  /** 触发目标（组件名、路由路径、定时器名等） */
  target: string;

  /** 具体事件名称 */
  event: string;

  /** 附加条件：满足此条件时触发器才生效 */
  guard?: string;
}

type TriggerType =
  | "UI_EVENT"        // 用户界面事件（click、input、submit 等）
  | "ROUTE_CHANGE"    // 路由变化
  | "API_RESPONSE"    // 接口响应到达
  | "TIMER"           // 定时触发
  | "STATE_CHANGE"    // 状态变更
  | "LIFECYCLE"       // 组件生命周期（mount、unmount）
  | "CUSTOM";         // 自定义触发类型
```

### 4.3 `Condition` 类型定义

```typescript
interface Condition {
  /** 条件描述（机器可读的逻辑表达式或自然语言） */
  expression: string;

  /** 条件类型 */
  type: "STATE_CHECK" | "AUTH_CHECK" | "DATA_VALID" | "CUSTOM";
}
```

### 4.4 `SideEffect` 类型定义

```typescript
interface SideEffect {
  /** 副作用类型 */
  type: "API_CALL" | "STATE_MUTATION" | "NAVIGATION" | "STORAGE" | "NOTIFICATION" | "CUSTOM";

  /** 副作用目标（API 路径、状态 key、路由路径等） */
  target: string;

  /** 副作用描述 */
  description?: string;
}
```

---

## 五、需求 ID 命名规则

### 5.1 格式

```
REQ-<MODULE>-<SEQ>
```

| 部分 | 规则 | 示例 |
| :--- | :--- | :--- |
| `REQ` | 固定前缀，全大写 | `REQ` |
| `<MODULE>` | 模块名，全大写，字母与连字符 | `USER-LOGIN`、`PRODUCT` |
| `<SEQ>` | 两位及以上数字序号 | `01`、`12` |

### 5.2 唯一性约束

- 同一项目中，所有 `.req.ts` 文件的 `id` 字段 **必须** 全局唯一。
- 编译时若检测到重复 ID，Babel 插件 **必须** 抛出编译错误并中止。

### 5.3 合法示例

```
REQ-USER-LOGIN-01
REQ-USER-LOGOUT-01
REQ-PRODUCT-SEARCH-01
REQ-CART-CHECKOUT-03
```

---

## 六、编译行为

### 6.1 编译流程

```
.req.ts 源文件
    │
    ▼
@chonky/babel-plugin 识别 defineRequirement() 调用
    │
    ├──▶ 输出 1: 编译后 JS —— 剥离 defineRequirement 包装，保留纯对象 export
    │
    └──▶ 输出 2: JSON 清单 —— 写入 .chonky/requirements/<ID>.json
```

### 6.2 编译后代码

Babel 插件将 `defineRequirement()` 调用替换为其参数对象本身：

**源代码：**

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

**编译后输出：**

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

### 6.3 JSON 清单文件

编译时同步输出到 `.chonky/requirements/` 目录：

**文件路径：** `.chonky/requirements/REQ-USER-LOGIN-01.json`

**内容：**

```json
{
  "id": "REQ-USER-LOGIN-01",
  "sourceFile": "src/features/auth/UserLogin.req.ts",
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

JSON 清单文件在原始字段之外附加以下元信息：

| 字段 | 说明 |
| :--- | :--- |
| `sourceFile` | 来源 `.req.ts` 的相对路径（相对项目根目录） |
| `_chonky.version` | 清单格式版本号 |
| `_chonky.generatedAt` | 生成时间（ISO 8601） |

### 6.4 清单索引文件

当项目包含多个需求定义时，插件在 `.chonky/requirements/` 下额外输出一份 `index.json`：

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

### 6.5 编译错误条件

| 条件 | 行为 |
| :--- | :--- |
| `id` 字段缺失或为空 | **编译错误**，中止 |
| `id` 格式不符合 `REQ-<MODULE>-<SEQ>` | **编译警告**（严格模式下升级为错误） |
| 同项目内出现重复 `id` | **编译错误**，中止 |
| `triggers` 数组为空 | **编译警告** |
| `.req.ts` 文件未使用 `export default` | **编译错误** |

---

## 七、完整示例：商品搜索需求

```typescript
// ProductSearch.req.ts
export default defineRequirement({
  id: "REQ-PRODUCT-SEARCH-01",
  name: "商品关键词搜索",
  description: "用户在搜索框输入关键词并提交后，展示匹配的商品列表",
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

## 八、变更记录

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | 初始版本发布 |

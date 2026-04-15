# Chonky 歧义消解协议 v1.0

**文档版本：** v1.0  
**发布日期：** 2026-04-14  
**文档状态：** 初始发布  
**所属里程碑：** 1.1 — 核心规范与接口文档冻结

---

## 一、概述

本规范定义了 Chonky 歧义消解协议（Ambiguity Resolution Protocol）。在 AI Agent 驱动的代码生成流程中，产品经理或需求方通过策略清单文件 `pm-requirement.json` 声明**不应使用的组件、API 或行为模式**，Babel 插件在编译时对生成代码进行双向校验：正向检查是否使用了禁止项，反向检查 `negate` 约束是否与代码行为矛盾。这一机制确保 AI Agent 的输出始终对齐产品意图，消除需求层面的歧义。

---

## 二、术语表

| 术语 | 含义 |
| :--- | :--- |
| **策略清单 (Policy Manifest)** | `pm-requirement.json` 文件，由产品经理或需求方维护 |
| **排除项 (Excluded)** | 明确禁止在代码中使用的组件、API 或模式 |
| **反向约束 (Negate)** | 声明某功能**不应具备**的行为，是对需求的否定描述 |
| **正向校验** | 检测代码中是否引用了排除项 |
| **反向校验** | 检测代码行为是否违背 negate 声明 |
| **严格模式 (Strict Mode)** | 将校验警告升级为编译错误的配置模式 |

---

## 三、策略清单文件

### 3.1 文件位置与命名

策略清单文件位于项目根目录：

```
<project-root>/pm-requirement.json
```

也可通过 `chonky.config.js` 指定自定义路径：

```javascript
module.exports = {
  ambiguity: {
    policyManifest: "./config/pm-requirement.json"
  }
};
```

### 3.2 完整 JSON Schema

```typescript
interface PolicyManifest {
  /** 策略清单版本 */
  version: string;

  /** 产品/项目标识 */
  projectId?: string;

  /** 排除规则列表 */
  rules: PolicyRule[];
}

interface PolicyRule {
  /** 规则唯一标识 */
  id: string;

  /** 关联的需求 ID（可选，关联到 defineRequirement 的 id） */
  requirementId?: string;

  /** 规则描述（人类可读） */
  description: string;

  /** 禁止使用的组件/API 列表 */
  excluded: ExcludedItem[];

  /** 反向约束列表：功能不应具备的行为 */
  negate?: NegateConstraint[];

  /** 推荐替代方案 */
  preferred?: PreferredItem[];

  /** 规则严重级别 */
  severity?: "warning" | "error";
}
```

### 3.3 `ExcludedItem` — 排除项定义

```typescript
interface ExcludedItem {
  /** 排除类型 */
  type: "component" | "api" | "import" | "pattern";

  /** 目标标识符 */
  target: string;

  /** 排除原因（编译时输出到警告/错误信息中） */
  reason: string;
}
```

各类型的 `target` 格式与匹配规则：

| `type` | `target` 格式 | 匹配逻辑 |
| :--- | :--- | :--- |
| `component` | 组件名（如 `"DatePicker"`） | 匹配 JSX 标签名 |
| `api` | API 路径或函数名（如 `"fetch"`、`"/api/v1/legacy"`) | 匹配函数调用或字符串字面量 |
| `import` | 包名或路径（如 `"moment"`、`"lodash/merge"`） | 匹配 `import` / `require` 语句 |
| `pattern` | 正则表达式字符串（如 `"document\\.cookie"`) | 匹配任意代码文本 |

### 3.4 `NegateConstraint` — 反向约束定义

```typescript
interface NegateConstraint {
  /** 约束标识 */
  id: string;

  /** 功能不应出现的行为描述 */
  behavior: string;

  /** 检测方式 */
  detection: NegateDetection;
}

interface NegateDetection {
  /** 检测类型 */
  type: "code_pattern" | "api_call" | "state_mutation" | "dom_operation";

  /** 检测目标（正则表达式或标识符） */
  pattern: string;

  /** 检测范围（限定到特定文件或目录） */
  scope?: string;
}
```

`negate` 约束用于表达**"这个功能不应该做什么"**。与 `excluded` 的区别在于：

- `excluded`：**全局性**禁止，任何文件都不应使用
- `negate`：**需求级**约束，限定在某个需求的实现范围内不应出现的行为

### 3.5 `PreferredItem` — 推荐替代方案

```typescript
interface PreferredItem {
  /** 被替代的目标（对应 excluded 中的 target） */
  replaces: string;

  /** 推荐使用的替代方案 */
  suggestion: string;

  /** 替代方案说明 */
  description?: string;
}
```

---

## 四、完整策略清单示例

```json
{
  "version": "1.0",
  "projectId": "chonky-demo-app",
  "rules": [
    {
      "id": "POLICY-UI-001",
      "requirementId": "REQ-USER-LOGIN-01",
      "description": "登录页面不得使用第三方日期选择器和旧版弹窗组件",
      "excluded": [
        {
          "type": "component",
          "target": "DatePicker",
          "reason": "登录流程无日期选择需求，防止 Agent 错误引入"
        },
        {
          "type": "component",
          "target": "LegacyModal",
          "reason": "已废弃，使用 Dialog 组件替代"
        },
        {
          "type": "import",
          "target": "moment",
          "reason": "项目统一使用 dayjs"
        }
      ],
      "negate": [
        {
          "id": "NEGATE-001",
          "behavior": "登录功能不应在客户端明文存储密码",
          "detection": {
            "type": "code_pattern",
            "pattern": "localStorage\\.setItem\\(['\"]password['\"]",
            "scope": "src/features/auth/**"
          }
        },
        {
          "id": "NEGATE-002",
          "behavior": "登录功能不应跳过服务端验证直接设置登录状态",
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
          "description": "使用设计系统中的 Dialog 组件"
        },
        {
          "replaces": "moment",
          "suggestion": "dayjs",
          "description": "轻量级日期库，API 兼容 moment"
        }
      ],
      "severity": "warning"
    },
    {
      "id": "POLICY-SECURITY-001",
      "description": "全局禁止直接操作 cookie 和 eval",
      "excluded": [
        {
          "type": "pattern",
          "target": "document\\.cookie",
          "reason": "使用 @chonkylang/runtime 提供的安全 cookie 封装"
        },
        {
          "type": "api",
          "target": "eval",
          "reason": "安全风险：禁止使用 eval"
        }
      ],
      "severity": "error"
    }
  ]
}
```

---

## 五、编译时双向校验逻辑

### 5.1 校验流程

```
源文件编译
    │
    ▼
Babel 插件加载 pm-requirement.json
    │
    ├──▶ 正向校验：扫描代码中的 excluded 匹配项
    │        │
    │        ├── component: 检查 JSX 标签名
    │        ├── api: 检查函数调用表达式
    │        ├── import: 检查 import/require 声明
    │        └── pattern: 正则匹配代码文本
    │
    └──▶ 反向校验：扫描代码中的 negate 匹配项
             │
             ├── code_pattern: 正则匹配代码文本
             ├── api_call: 检查函数调用表达式
             ├── state_mutation: 检查赋值表达式
             └── dom_operation: 检查 DOM API 调用
```

### 5.2 正向校验规则

对每个编译的源文件，插件遍历所有 `rules[].excluded` 条目：

1. **component 类型：** 在 AST 中查找 `JSXOpeningElement`，比较标签名与 `target`。
2. **api 类型：** 在 AST 中查找 `CallExpression`，比较 callee 名称与 `target`。
3. **import 类型：** 在 AST 中查找 `ImportDeclaration` 和 `require()` 调用，比较 source 与 `target`。
4. **pattern 类型：** 将 `target` 编译为正则表达式，对源文件文本执行全文匹配。

### 5.3 反向校验规则

反向校验仅在源文件路径匹配 `negate[].detection.scope` 时执行（scope 缺省时对全项目生效）：

1. 将 `detection.pattern` 编译为正则表达式。
2. 根据 `detection.type` 决定匹配目标：
   - `code_pattern`：全文正则匹配
   - `api_call`：仅匹配 `CallExpression` 节点的序列化文本
   - `state_mutation`：仅匹配 `AssignmentExpression` 节点的序列化文本
   - `dom_operation`：匹配 `document.*` 或 `window.*` 相关的 `MemberExpression` 调用
3. 匹配成功表示代码中**存在 negate 声明所禁止的行为**。

### 5.4 校验时机

校验发生在 **Babel 插件的 `Program:exit` 钩子**中，即单个文件的 AST 遍历完成后、代码生成前执行。这确保：

- 所有 AST 节点已被访问
- 校验结果可在同一编译周期内输出
- 不影响其他转译逻辑的执行

---

## 六、输出行为

### 6.1 默认模式

校验命中时输出**编译警告**（不中断构建）：

```
⚠ [chonky/ambiguity] POLICY-UI-001: Component "DatePicker" is excluded.
  Reason: 登录流程无日期选择需求，防止 Agent 错误引入
  Preferred: (no alternative specified)
  File: src/features/auth/LoginForm.tsx:15:5

⚠ [chonky/ambiguity] POLICY-UI-001/NEGATE-001: Negate constraint violated.
  Behavior: 登录功能不应在客户端明文存储密码
  Matched: localStorage.setItem("password", ...)
  File: src/features/auth/LoginService.ts:42:3
```

### 6.2 严格模式

通过 `chonky.config.js` 全局开启或在规则级别通过 `severity: "error"` 单独指定：

```javascript
// chonky.config.js — 全局严格模式
module.exports = {
  ambiguity: {
    strictMode: true
  }
};
```

严格模式下，所有校验命中升级为**编译错误**，中断构建并输出详细信息：

```
✖ [chonky/ambiguity] POLICY-SECURITY-001: Pattern "document.cookie" is excluded.
  Reason: 使用 @chonkylang/runtime 提供的安全 cookie 封装
  File: src/utils/analytics.ts:8:1
  Build aborted.
```

### 6.3 规则级 severity 覆盖

当规则自身声明了 `severity: "error"` 时，即使全局未开启 `strictMode`，该规则的校验命中也会产生编译错误：

```json
{
  "id": "POLICY-SECURITY-001",
  "severity": "error",
  "excluded": [...]
}
```

优先级：`rule.severity` > `config.ambiguity.strictMode` > 默认 `"warning"`

### 6.4 校验报告

每次编译完成后，校验结果会汇总输出到 `.chonky/ambiguity-report.json`：

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
      "behavior": "登录功能不应在客户端明文存储密码",
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

## 七、与其他规范的协作

### 7.1 与结构化需求定义的关系

`PolicyRule.requirementId` 字段将策略规则关联到 `defineRequirement` 定义的需求。当关联后：

- 反向校验的 `scope` 可自动推导为需求实现所在的目录
- 校验报告中会附带需求名称和描述，便于追溯

### 7.2 与验证规则引擎的关系

歧义消解协议在**编译阶段**运行，早于 `machine:assert` 生成的测试。二者职责互补：

- **歧义消解**：确保代码不使用禁止项、不违背反向约束（编译期静态检查）
- **验证规则引擎**：确保代码行为符合正向需求（运行期动态测试）

---

## 八、配置参考

`chonky.config.js` 中与歧义消解相关的完整配置：

```javascript
module.exports = {
  ambiguity: {
    /** 策略清单文件路径（默认 ./pm-requirement.json） */
    policyManifest: "./pm-requirement.json",

    /** 全局严格模式（默认 false） */
    strictMode: false,

    /** 是否生成校验报告（默认 true） */
    generateReport: true,

    /** 校验报告输出路径（默认 .chonky/ambiguity-report.json） */
    reportPath: ".chonky/ambiguity-report.json",

    /** 忽略的文件 glob 模式 */
    ignorePatterns: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "__tests__/**"
    ]
  }
};
```

---

## 九、变更记录

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | 初始版本发布 |

### **Chonky 编程语言详细设计报告 v1.2**

**项目代号：** Chonky (胖蜜蜂)
**核心定位：** 面向机器学习自编程系统的 Web 开发语言
**实现路径：** TypeScript 的超集 (Superset)
**文档日期：** 2026-04-14
**文档状态：** **第一阶段 MVP 设计定稿**

---

### **一、 项目概述与核心理念**

#### 1.1 项目背景
现有编程语言（包括 JavaScript/TypeScript）在设计之初均以**人类开发者**的认知习惯为核心，强调语法糖、简洁性和可读性。然而，在 AI 驱动的编程范式（WebCoding）下，**大语言模型是代码的主要生产者**，人类则转变为需求提供者、规则制定者和最终确认者。语言的人性化设计反而成为机器理解、生成和调试代码的噪音与歧义来源。

#### 1.2 核心设计哲学：机器优先 (Machine-First)
Chonky 的设计完全倒置传统优先级，遵循三大原则：
1.  **机器可理解 (Machine-Understandable)：** 语法无歧义，数据结构显式声明，控制流线性化。
2.  **机器可执行 (Machine-Executable)：** 从需求到验证均由工具链和 AI Agent 自动闭环。
3.  **机器可优化 (Machine-Optimizable)：** 性能调优、资源处理由编译器自主决策，人类仅设定边界规则。

**关键决策补充：代码可读性策略**
- **Chonky 源码（机器生成形态）：** 以机器解析效率为第一优先级，**无需考虑人类直接阅读**。代码风格将趋向于无语法糖、高冗长性的 AST 直接映射格式。
- **人类介入兜底机制：** 当必须进行人工紧急干预时，工具链提供 **实时语义化翻译视图**。该视图会将机器优化的代码即时翻译为语法高亮、结构清晰的标准 TypeScript 风格描述，供人类理解与临时修改。修改后的代码将通过反向编译（Transpile）重新变回机器优化格式。

#### 1.3 分阶段实现策略（根据最新决策更新）

**第一阶段（当前阶段）：基于 Babel/SWC 插件的 npm 包实现**
- **核心目标：** 在不修改 TypeScript 编译器源码的前提下，快速落地 Chonky 的语法扩展与元数据收集功能。
- **技术方案：** 发布一个名为 `@chonky/core` 的 npm 包，内部集成：
    1.  **Babel 插件 / SWC 插件：** 用于识别并转译 `.chonky.ts` 或 `.cts` 文件中的特殊语法（如 `machine:assert`、`defineRequirement`）。将新语法编译为可在现有浏览器/Node.js 运行的等效 TypeScript 代码。
    2.  **运行时库：** 提供 `__CHONKY_RENDER_META__` 收集器、`Image` 优化组件等浏览器端辅助功能。
    3.  **CLI 工具：** 提供 `chonky dev` 和 `chonky build` 命令，封装 Webpack/Vite 插件，自动处理文件转译和元数据输出。
- **优势：** 0 侵入现有项目，无需更换 TypeScript 编译器，开发周期短，生态兼容性极强。

**第二阶段（未来优化阶段）：Rust 重构编译器核心**
- **触发条件：** 当 npm 包用户量增加，且构建性能成为瓶颈时启动。
- **目标：** 使用 Rust 重写转译核心（类似 SWC 之于 Babel），实现 10 倍以上的编译速度提升，并开启更激进的“自主性能调优”（如自动 Wasm 拆分）。

---

### **二、 第一阶段：基于 npm 包的核心语法实现**

本章节定义的所有特性，将通过 `@chonky/babel-plugin` 在构建阶段转换。

#### 2.1 结构化需求定义语言 (Structured Requirement Definition)
**目的：** 废除自然语言注释描述功能，强制使用 JSON-Schema 定义功能逻辑。

**语法与实现：**
开发者编写 `.req.ts` 文件，Babel 插件将其转换为普通的 JS 对象导出，同时在构建时生成一份对应的 `manifest.json` 供 AI Agent 读取。

```typescript
// 源代码: UserLogin.req.ts
export default defineRequirement({
  id: "REQ-USER-LOGIN-01",
  triggers: [
    { type: "UI_EVENT", target: "LoginButton", event: "click" }
  ],
  // ... 其他配置
});

// 编译后: Babel 插件会移除 defineRequirement 包装，仅保留对象，
// 并额外输出 .chonky/requirements/REQ-USER-LOGIN-01.json
```

#### 2.2 自动执行的验证规则引擎 (Autonomous Verification Engine)
**语法与实现：**
`machine:assert` 块会被 Babel 插件转换为 Jest/Vitest 兼容的测试代码。

```typescript
// 源代码
machine:assert for "REQ-USER-LOGIN-01" {
  scenario("Password too short", () => {
    // ...
  });
}

// 编译输出 (由 Babel 插件生成到 __tests__ 目录)
import { test, expect } from '@chonky/runtime/test';
test('REQ-USER-LOGIN-01 | Password too short', () => {
  // 转换后的断言逻辑
});
```

#### 2.3 模块依赖与并发安全图谱
**实现方案：**
- **第一阶段实现：** 不依赖 `moduleCalls` 手动声明。`@chonky/cli` 命令 `chonky graph` 使用 `madge` 或 TypeScript Compiler API 对项目进行静态分析，自动生成依赖图 JSON 文件。
- **并发标记：** `@concurrencySafe` 仅作为代码注释保留，在第一阶段不进行强校验，仅用于生成图谱时的元数据标注。

#### 2.4 渲染元数据协议 (Render Metadata Protocol)
**实现方案：**
通过 `@chonky/runtime` 提供的 Babel 插件，自动为所有 JSX 组件包裹高阶函数，在开发环境下注入 `data-chonky-id` 和上报逻辑。

```typescript
// 开发者代码
<Button>提交</Button>

// 开发环境编译后（由 Babel 插件注入）
<_ChonkyWrapper componentName="Button" props={{ children: "提交" }}>
  <Button>提交</Button>
</_ChonkyWrapper>
```

#### 2.5 歧义消解协议
**实现方案：**
Babel 插件在编译时会读取 `pm-requirement.json` 列表。当检测到代码中实例化了 `excluded` 组件时，发出 **编译时警告（非阻塞性）** 或 **错误（通过配置开启严格模式）**。

---

### **三、 面向机器的性能优化体系（第一阶段实现边界）**

由于第一阶段不涉及 Rust 编译器，性能优化主要通过 **运行时库** 和 **构建工具链配置** 实现。

#### 3.1 资源引用自动决策框架
**实现方案：** 提供 `@chonky/ui` 组件库封装。
- `Image` 组件内部集成 `sharp` (服务端构建时) 或调用图片 CDN 参数，自动处理格式转换。
- 构建时通过 `@chonky/webpack-plugin` 扫描图片引用，输出 WebP 版本并重写 HTML。

#### 3.2 交互式决策询问机制与静默模式
**实现方案：**
- 询问交互通过 **终端交互库 (Inquirer.js)** 在 `chonky dev` 或 `chonky optimize` 命令中实现。
- 静默模式配置存储在 `chonky.config.js` 中。

```javascript
// chonky.config.js
module.exports = {
  optimizer: {
    silentMode: {
      imageFormatConversion: true, // 格式转换静默
      sizeReductionThreshold: 0.3, // 体积缩小小于 30% 不询问
    }
  }
};
```

---

### **四、 人机协作边界定义**

| **环节** | **人类职责 (Chonky 模式)** | **机器职责 (AI Agent + npm 包工具链)** |
| :--- | :--- | :--- |
| **代码编写** | **禁止直接编写逻辑代码**。紧急情况下通过 `chonky view` 命令查看语义化翻译视图临时介入。 | Babel 插件转换代码，AI Agent 生成业务逻辑。 |
| **资源处理** | 回答“是/否”或选择“性能优先/质量优先”。 | `@chonky/webpack-plugin` 执行格式转换。 |
| **调试** | 描述现象：“登录失败了”。 | 读取 `window.__CHONKY_LOGS__` 和断言报告。 |

---

### **五、 第一阶段开发路线图（基于 npm 包）**

1.  **1: 搭建 Monorepo 基础架构**
    - 初始化 `packages/core`, `packages/babel-plugin`, `packages/runtime`, `packages/cli`。
2.  **2 实现基础语法转译**
    - 支持 `defineRequirement` 和 `machine:assert` 转译。
    - 确保编译后代码在标准 TypeScript 环境下运行无误。
3.  **3: 实现渲染元数据注入**
    - 完成 JSX 包裹插件的开发。
    - 开发浏览器端调试面板（用于展示 `__CHONKY_RENDER_META__`）。
4.  **4: 发布 0.1.0 Alpha 版本**
    - 提供 `create-chonky-app` 脚手架，用于快速验证。

**后续规划：** 待第一阶段验证成熟、用户反馈稳定后，再启动 Rust 编译器核心的预研。


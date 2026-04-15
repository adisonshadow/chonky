# Chonky 项目目录结构说明

**文档版本：** v1.0  
**更新日期：** 2026-04-14

---

## 顶层目录总览

```
Chonky/
├── packages/                 # 第一阶段 npm 包（Monorepo 子包）
│   ├── core/                 # @chonkylang/core — 统一入口，聚合导出
│   ├── transpiler/           # @chonkylang/transpiler — Babel/SWC 转译插件
│   ├── runtime/              # @chonkylang/runtime — 浏览器运行时库
│   ├── cli/                  # @chonkylang/cli — 命令行工具
│   ├── devtools/             # @chonkylang/devtools — 浏览器开发者工具面板
│   ├── ui/                   # @chonkylang/ui — 优化组件库（Image 等）
│   ├── vite-plugin/          # @chonkylang/vite-plugin — Vite 构建插件
│   └── webpack-plugin/       # @chonkylang/webpack-plugin — Webpack 构建插件
├── crates/                   # 第二阶段 Rust 编译器（Cargo workspace）
│   └── chonkyc/              # chonkyc 编译器二进制
├── examples/                 # 示例项目
│   └── todomvc/              # Chonky TodoMVC 演示应用
├── docs/                     # 设计文档、规范、路线图
├── scripts/                  # 构建、CI、发布脚本
├── .cursor/                  # Cursor IDE 配置
│   └── rules/                # AI 编程规则
├── README.md                 # 英文 README
├── README.zh-CN.md           # 中文 README
├── package.json              # Monorepo 根配置
├── pnpm-workspace.yaml       # pnpm workspace 声明
├── tsconfig.json             # 根级 TypeScript 配置
└── chonky.config.js          # Chonky 工具链自身的配置（示例）
```

---

## 各目录详细说明

### `packages/` — npm 包（第一阶段核心）

Monorepo 中的所有可发布 npm 包均放在此目录下，每个子目录是一个独立的 npm 包。

#### `packages/core/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/core` |
| **职责** | 统一入口包，聚合导出 transpiler、runtime 中的公共 API，便于用户一次安装 |
| **里程碑** | 贯穿 1.2 – 1.4 |

#### `packages/transpiler/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/transpiler` |
| **职责** | Babel/SWC 插件本体：识别并转换 `defineRequirement`、`machine:assert`、JSX 包裹等 Chonky 扩展语法 |
| **里程碑** | 1.2 |
| **关键产出** | 编译后标准 TS/JS 代码、`.chonky/requirements/*.json` 清单、`__tests__/*.test.ts` |

#### `packages/runtime/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/runtime` |
| **职责** | 浏览器端运行时：`ChonkyRenderer`（元数据收集）、`_ChonkyWrapper`（JSX 包裹组件）、`verify()` 断言函数、`@chonkylang/runtime/test` 测试适配层 |
| **里程碑** | 1.3 |

#### `packages/cli/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/cli` |
| **职责** | 命令行入口：`chonky init`、`chonky dev`、`chonky build`、`chonky graph`、`chonky optimize`、`chonky view`、`chonky revert` |
| **里程碑** | 1.4、1.5 |

#### `packages/devtools/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/devtools` |
| **职责** | 浏览器开发者工具面板扩展，可视化渲染元数据、依赖图谱、需求完成度 |
| **里程碑** | 1.3 |

#### `packages/ui/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/ui` |
| **职责** | 优化组件库：`Image` 组件（集成 sharp / CDN 参数自动处理）等 |
| **里程碑** | 1.3 |

#### `packages/vite-plugin/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/vite-plugin` |
| **职责** | Vite 构建集成：自动注册 transpiler、处理资源优化、注入运行时 |
| **里程碑** | 1.4 |

#### `packages/webpack-plugin/`

| 项 | 说明 |
| :--- | :--- |
| **包名** | `@chonkylang/webpack-plugin` |
| **职责** | Webpack 构建集成：功能同 vite-plugin，适配 Webpack 生态 |
| **里程碑** | 1.4 |

---

### `crates/` — Rust 编译器（第二阶段）

第二阶段启动后，此目录作为 Cargo workspace 根。

#### `crates/chonkyc/`

| 项 | 说明 |
| :--- | :--- |
| **产物** | `chonkyc` 可执行二进制 |
| **职责** | Rust 实现的 Chonky 编译器：AST 解析、语法转换、自主性能调优（Wasm 拆分、合成层分配等） |
| **里程碑** | 2.2 – 2.5 |

---

### `examples/` — 示例项目

#### `examples/todomvc/`

| 项 | 说明 |
| :--- | :--- |
| **职责** | Chonky TodoMVC 演示应用，完整展示需求定义、断言验证、渲染元数据、DevTools 面板等核心功能 |
| **里程碑** | 1.6 |

---

### `docs/` — 文档

所有设计文档、规范文档、路线图均存放在此目录：

| 文件 | 说明 |
| :--- | :--- |
| `Chonky 编程语言详细设计报告.md` | 语言总体设计报告 v1.2 |
| `ROADMAP.md` / `ROADMAP.zh-CN.md` | 实施路线图与里程碑 |
| `CONTRIBUTING.md` | 贡献指南（英文） |
| `project-structure.md` | 本文件 — 项目目录结构说明 |
| `spec-structured-requirement-definition.md` | 结构化需求定义规范 v1.0 |
| `spec-render-metadata-protocol.md` | 渲染元数据协议 v1.0 |
| `spec-verification-engine.md` | 验证规则引擎规范 v1.0 |
| `spec-ambiguity-resolution-protocol.md` | 歧义消解协议 v1.0 |
| `spec-silent-mode-and-interaction.md` | 静默模式与交互式询问阈值规范 v1.0 |

---

### `scripts/` — 脚本

存放构建、CI/CD、发布流程中使用的辅助脚本。

---

### 根目录配置文件（规划）

| 文件 | 说明 |
| :--- | :--- |
| `package.json` | Monorepo 根配置（workspaces、devDependencies） |
| `pnpm-workspace.yaml` | pnpm workspace 子包声明 |
| `tsconfig.json` | 根级 TypeScript 配置（子包通过 `extends` 继承） |
| `chonky.config.js` | Chonky 工具链示例配置 |
| `.gitignore` | Git 忽略规则 |

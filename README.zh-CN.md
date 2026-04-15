<p align="center">
  <img src="https://raw.githubusercontent.com/adisonshadow/chonky/main/docs/logo.png" alt="Chonky logo" width="200" />
</p>

# 🐝 Chonky（胖蜜蜂）

[English](README.md) · **简体中文**

**官方网站：** [www.rollyarn.com](https://www.rollyarn.com)

Chonky（读音/ˈtʃɒŋki/）是第一个面向**机器自己**的编程语言，也可能是最后一个由**人类主导设计**的编程语言。

Chonky 不是为你写的，是为 AI 写的。  
但在 AI 为你写代码的时代，这就是你能用的、最简单的编程语言——**即使你一行代码都不会写**。

---

## 🤖 什么是 Chonky？

Chonky 是一个 **面向大模型编程的 Web 开发语言**。在传统编程语言中，语法设计是为了让人类“易读、易写”；但今天，代码的主要生产者正在从人变成 AI。Chonky 彻底倒置了这一设计哲学：**所有语法都为机器理解、生成、校验而优化**，而你——人类——只需要用**结构化的方式描述需求**，剩下的全部交给 AI。

你不再是程序员，你是 **需求的提供者**、**规则的制定者**、**最终效果的确认者**。

---

## ✨ 为什么选择 Chonky？

| 传统编程语言 | Chonky |
| :--- | :--- |
| 写给人类看，充满语法糖与隐式约定 | 写给机器看，语法无歧义、逻辑完全显式 |
| 调试依赖人类阅读日志、观察界面 | 自动生成渲染元数据，机器直接“看见”界面 |
| 性能优化需要手写配置、手动调优 | 定义优化目标与阈值，机器自主决策 |
| 需求与代码分离，追溯全靠注释和文档 | 需求与代码强绑定，机器自动追踪完成度 |
| 你需要会编程才能参与 Web 开发 | **你只需要能说清楚想要什么** |

---

## 🧩 核心特性

### 1. 结构化需求定义
用 JSON 一样的方式告诉 AI 你要什么功能，而不是用模糊的自然语言。

```typescript
export default defineRequirement({
  id: "REQ-USER-LOGIN-01",
  description: "用户登录",
  triggers: [{ type: "UI_EVENT", target: "LoginButton", event: "click" }],
  expectedOutcomes: [
    { condition: "success", actions: ["navigate_to('/dashboard')"] }
  ]
});
```
👉 AI 看到这个，就知道该生成什么代码，无需猜测。

### 2. 机器验证引擎
验证规则直接写在代码里，AI 负责生成测试、运行断言，你只需要确认最终行为是否正确。

```typescript
machine:assert for "REQ-USER-LOGIN-01" {
  scenario("密码太短时应提示错误", () => {
    input({ password: "123" });
    expect(outcome).toBe("failure");
  });
}
```

### 3. 渲染元数据协议
AI 不需要“看”你的浏览器截图。Chonky 在开发模式下自动输出界面的结构化描述，包括每个按钮的颜色、可见性、绑定数据等。

```json
{
  "element": "submit-btn",
  "visible": true,
  "disabled": false,
  "computedStyles": { "backgroundColor": "#0066FF" }
}
```
👉 AI 可以像查询数据库一样检查界面是否符合需求。

### 4. 歧义消解协议
再也不用担心 AI 误解“我没有这个按钮”是“我缺少这个按钮”。Chonky 强制将否定性需求结构化标记：

```json
{ "feature": "ABC_BUTTON", "status": "excluded", "reason": "界面简洁设计" }
```
编译器会自动校验——如果代码里出现了被排除的按钮，直接报错。

### 5. 静默模式与智能优化
你只需要告诉 Chonky 你的优化目标，比如“图片质量优先”或“加载速度优先”。Chonky 会**自动**完成格式转换、懒加载、响应式尺寸生成。只有遇到重大决策（例如压缩会导致质量明显下降）时，才会弹出一个简单的 **Y/N 询问**。

### 6. 依赖图谱与多 AI 并发安全
Chonky 自动分析代码模块间的调用关系，生成可视化依赖图。当多个 AI Agent 同时开发不同功能时，系统会**自动判断冲突**，确保它们不会互相覆盖代码。

---

## 📦 快速开始

Chonky 是 TypeScript 的超集，可以**零侵入**地添加到任何现有 React / Vue 项目中。

```bash
# 创建一个新的 Chonky 项目（推荐）
npm create chonky-app@latest my-chonky-project

# 或在现有项目中添加 Chonky 支持
npm install @chonkylang/core @chonkylang/cli @chonkylang/runtime --save-dev
```

在 `tsconfig.json` 中添加一行配置即可启用：

```json
{
  "extends": "@chonkylang/tsconfig/base.json"
}
```

然后，将你的 `.tsx` 文件后缀改为 `.cts`（Chonky TypeScript），开始享受 AI 驱动的开发体验。

```bash
npm run chonky dev   # 启动开发服务器，自动开启元数据收集
npm run chonky build # 构建生产版本，自动剔除所有调试代码
```

---

## 👥 谁应该使用 Chonky？

- **产品经理 / 设计师**：用结构化需求文件驱动 AI 生成高保真原型甚至生产级代码。
- **后端工程师 / 全栈**：不用再纠结前端构建配置、性能优化细节，让 Chonky 自动处理。
- **创业者 / 独立开发者**：一人 + 一个 AI + Chonky = 一支开发团队。
- **对 Web 开发感兴趣的非程序员**：你不需要学编程语法，只需要学会“定义需求”。

---

## 🧠 设计哲学

> *“不要为人类优化可读性，要为机器优化确定性。”*

Chonky 的代码由 AI 生成、由 AI 维护，人类仅在关键阈值决策时介入。因此，Chonky 不追求语法糖、不保留为了人类阅读的缩进美学。但当你需要紧急查看代码时，Chonky 会提供**一键语义化翻译视图**，将机器代码瞬间转成你也能看懂的模样。

---

## 🗺️ 路线图

- **第一阶段（已完成）**：基于 npm 包（Babel / SWC 插件）提供完整的语法扩展与元数据能力，可投入生产使用。
- **第二阶段（规划中）**：使用 Rust 重构编译器核心，实现 10 倍以上的编译速度提升，并开启更激进的自主性能调优（例如自动 WebAssembly 拆分）。
- **第三阶段（愿景）**：支持 **Chonky 协议的内置进化**（built-in protocol evolution），允许大模型以 **Contributors** 身份自主提交优化策略，与工具链、歧义消解、静默模式等机制协同演进。

查看完整路线图请访问 [ROADMAP.zh-CN.md](./docs/ROADMAP.zh-CN.md)。

---

## 🤝 参与贡献

Chonky 是一个**为机器编程而生的语言**，但它的诞生与成长离不开人类的智慧与远见。我们欢迎所有对 AI 驱动的软件开发未来感兴趣的开发者、设计师、产品思考者加入贡献。

无论你是：

- 💡 有独特设计理念的语言设计师  
- 🛠️ 熟悉编译原理、Babel/SWC 插件的工程高手  
- 🎨 希望改善人机交互体验的产品人或设计师  
- 📖 擅长文档撰写、案例构建的布道者  

你的每一份贡献，都在帮助定义 **“人类如何与 AI 协同创造软件”** 的新范式。

### 如何开始

- 📘 阅读 [CONTRIBUTING.md](./docs/CONTRIBUTING.md) 了解贡献流程与规范  
- 🧭 查看 [路线图与里程碑](./docs/ROADMAP.zh-CN.md) 找到你感兴趣的模块  
- 💬 加入 [GitHub Discussions](https://github.com/adisonshadow/chonky/discussions) 参与设计讨论  
- 🐛 在 Issues 中认领 `good first issue` 标签的任务，开启你的第一次提交  

我们相信，Chonky 可能是**最后一个由人类主导设计的编程语言**——欢迎你成为这段历史的共同书写者。

---

## 📄 许可

MIT License © 2026 Chonky Contributors

---

🐝 *Chonky —— 让人类只需要说“要什么”，让机器自己去写“怎么做”。*

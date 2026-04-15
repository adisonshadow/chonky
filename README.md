<p align="center">
  <img src="https://raw.githubusercontent.com/adisonshadow/chonky/main/docs/logo.png" alt="Chonky logo" width="200" />
</p>

# 🐝 Chonky 

**English** · [简体中文](README.zh-CN.md)

**website:** [www.rollyarn.com](https://www.rollyarn.com)

The first programming language designed **for machines themselves**, and possibly the last programming language **designed by humans**.

Chonky is not written for you. It is written for AI.  
But in an era where AI writes code for you, this is the simplest programming language you can use—**even if you cannot write a single line of code**.

---

## 🤖 What is Chonky?

Chonky is a **web development language oriented toward large language model programming**. In traditional programming languages, syntax is designed to be "human-readable and writable"; however, today, the primary producer of code is shifting from humans to AI. Chonky completely inverts this design philosophy: **all syntax is optimized for machine understanding, generation, and verification**, while you—the human—only need to **describe requirements in a structured way**. The rest is fully delegated to AI.

You are no longer a programmer; you are a **provider of requirements**, a **setter of rules**, and the **confirmer of final outcomes**.

---

## ✨ Why Choose Chonky?

| Traditional Programming Languages | Chonky |
| :--- | :--- |
| Written for humans, full of syntactic sugar and implicit conventions | Written for machines, unambiguous syntax, fully explicit logic |
| Debugging relies on humans reading logs and observing interfaces | Automatically generates render metadata; machines directly "see" the interface |
| Performance optimization requires manual configuration and tuning | Define optimization goals and thresholds; machines decide autonomously |
| Requirements and code are separated; traceability depends on comments and docs | Requirements are strongly bound to code; machines automatically track completion |
| You need programming skills to participate in web development | **You only need to clearly articulate what you want** |

---

## 🧩 Core Features

### 1. Structured Requirement Definition
Tell AI what functionality you want in a JSON-like manner, rather than using ambiguous natural language.

```typescript
export default defineRequirement({
  id: "REQ-USER-LOGIN-01",
  description: "User Login",
  triggers: [{ type: "UI_EVENT", target: "LoginButton", event: "click" }],
  expectedOutcomes: [
    { condition: "success", actions: ["navigate_to('/dashboard')"] }
  ]
});
```
👉 When AI sees this, it knows exactly what code to generate—no guessing required.

### 2. Machine Validation Engine
Validation rules are written directly in the code. AI is responsible for generating tests and running assertions; you only need to confirm whether the final behavior is correct.

```typescript
machine:assert for "REQ-USER-LOGIN-01" {
  scenario("Should show error when password is too short", () => {
    input({ password: "123" });
    expect(outcome).toBe("failure");
  });
}
```

### 3. Render Metadata Protocol
AI does not need to "look" at screenshots of your browser. In development mode, Chonky automatically outputs a structured description of the interface, including the color, visibility, bound data, etc., of each button.

```json
{
  "element": "submit-btn",
  "visible": true,
  "disabled": false,
  "computedStyles": { "backgroundColor": "#0066FF" }
}
```
👉 AI can inspect whether the interface meets requirements as if querying a database.

### 4. Ambiguity Resolution Protocol
Never worry again about AI misinterpreting "I don't have this button" as "I am missing this button." Chonky enforces structured tagging of negative requirements:

```json
{ "feature": "ABC_BUTTON", "status": "excluded", "reason": "Clean interface design" }
```
The compiler automatically validates—if the code contains an excluded button, it throws an error directly.

### 5. Silent Mode and Intelligent Optimization
You only need to tell Chonky your optimization goals, such as "prioritize image quality" or "prioritize loading speed." Chonky will **automatically** handle format conversion, lazy loading, and responsive size generation. Only when a major decision is required (e.g., compression would cause noticeable quality degradation) will it pop up a simple **Y/N prompt**.

### 6. Dependency Graph and Multi-AI Concurrency Safety
Chonky automatically analyzes call relationships between code modules and generates a visual dependency graph. When multiple AI agents are simultaneously developing different features, the system **automatically detects conflicts**, ensuring they do not overwrite each other's code.

---

## 📦 Quick Start

Chonky is a superset of TypeScript and can be added to any existing React / Vue project **with zero intrusion**.

```bash
# Create a new Chonky project (recommended)
npm create chonky-app@latest my-chonky-project

# Or add Chonky support to an existing project
npm install @chonky/core @chonky/cli @chonky/runtime --save-dev
```

Enable it by adding a single line to your `tsconfig.json`:

```json
{
  "extends": "@chonky/tsconfig/base.json"
}
```

Then, change your `.tsx` file extensions to `.cts` (Chonky TypeScript) and start enjoying an AI-driven development experience.

```bash
npm run chonky dev   # Start dev server, automatically enable metadata collection
npm run chonky build # Build for production, automatically tree-shake all debugging code
```

---

## 👥 Who Should Use Chonky?

- **Product Managers / Designers**: Drive AI to generate high-fidelity prototypes or even production-grade code using structured requirement files.
- **Backend Engineers / Full-stack Developers**: Stop wrestling with frontend build configurations and performance tuning details; let Chonky handle it automatically.
- **Entrepreneurs / Indie Developers**: One person + one AI + Chonky = a development team.
- **Non-programmers interested in Web Development**: You don't need to learn programming syntax; you just need to learn how to "define requirements."

---

## 🧠 Design Philosophy

> *"Do not optimize readability for humans; optimize certainty for machines."*

Chonky's code is generated and maintained by AI, with humans intervening only at critical threshold decisions. Therefore, Chonky does not pursue syntactic sugar nor preserve indentation aesthetics for human reading. However, when you urgently need to inspect the code, Chonky provides a **one-click semantic translation view**, instantly transforming machine code into a form that you can also understand.

---

## 🗺️ Roadmap

- **Phase 1 (completed)**: Full syntax extensions and metadata via npm packages (Babel / SWC plugins); production-ready.
- **Phase 2 (planned)**: Rust compiler core for 10x+ build speed and more aggressive autonomous tuning (e.g. automatic WebAssembly splitting).
- **Phase 3 (vision)**: **Built-in evolution of the Chonky protocol**—large language models may act as **Contributors**, automatically proposing optimization strategies that evolve alongside the toolchain, ambiguity resolution, and silent-mode policies.

For the full roadmap, please visit [ROADMAP.md](./docs/ROADMAP.md).

---

## 🤝 Contributing

Chonky is a **language born for machine programming**, but its inception and growth cannot be separated from human wisdom and foresight. We welcome all developers, designers, and product thinkers interested in the future of AI-driven software development to contribute.

Whether you are:

- 💡 A language designer with unique concepts  
- 🛠️ An engineering expert familiar with compiler theory and Babel/SWC plugins  
- 🎨 A product person or designer looking to improve human-computer interaction  
- 📖 An evangelist skilled in documentation and case study construction  

Every contribution you make helps define a new paradigm for **"how humans collaborate with AI to create software."**

### How to Get Started

- 📘 Read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) to understand contribution processes and guidelines  
- 🧭 Check the [Roadmap & Milestones](./docs/ROADMAP.md) to find modules that interest you  
- 💬 Join [GitHub Discussions](https://github.com/adisonshadow/chonky/discussions) to participate in design discussions  
- 🐛 Claim tasks labeled `good first issue` in Issues and start your first commit  

We believe Chonky might be **the last programming language designed by humans**—welcome to be a co-author of this history.

---

## 📄 License

MIT License © 2026 Chonky Contributors

---

🐝 *Chonky — Let humans simply say "what they want," and let machines figure out "how to do it" themselves.*

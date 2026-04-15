
The roadmap is divided into two major phases:

- **Phase 1 (MVP):** Implement core syntax and metadata collection based on npm packages (Babel/SWC plugins) to quickly validate the design concept.
- **Phase 2 (Performance Leap):** Refactor the compiler core with Rust to achieve autonomous performance tuning and extreme compilation speed.

Each phase begins with **specification and design documentation** as the starting milestone.

---

### Chonky Implementation Roadmap and Milestones (Based on v1.1 Design)

#### Phase 1: Functional Validation and Ecosystem Integration via npm Packages

**Overall Goal:**  
Without disrupting the existing TypeScript compiler ecosystem, implement Chonky's core syntax extensions, metadata collection protocols, and foundational human-machine collaboration workflows through a set of npm packages (compiler plugin + runtime library + CLI tool), enabling developers to immediately trial the Chonky paradigm in existing projects.

##### Milestone 1.1: Core Specifications and Interface Documentation Freeze

- **Deliverables:**
  - *Chonky Structured Requirement Definition Specification v1.0*: Detailed definition of JSON Schema fields, type constraints, and examples for `defineRequirement`.
  - *Chonky Render Metadata Protocol v1.0*: Specification of `window.__CHONKY_RENDER_META__` data structure, reporting timing, and query interface standards.
  - *Chonky Validation Rule Engine Specification v1.0*: Definition of `machine:assert` syntax extension rules, compilation targets (Jest/Vitest), and binding methods with requirement IDs.
  - *Chonky Ambiguity Resolution Protocol v1.0*: Explanation of the `negate` field usage rules and the triggering logic for compile-time bidirectional validation.
  - *Chonky Silent Mode and Interactive Prompt Threshold Specification v1.0*: Listing default thresholds for various resource optimizations, silent trigger conditions, and terminal prompt templates.

- **Acceptance Criteria:** All specification documents pass internal review and serve as the sole basis for subsequent toolchain implementation.

##### Milestone 1.2: Babel/SWC Transpiler Plugin Development

- **Goal:** Implement compile-time transformation of Chonky extended syntax, converting `.chonky.ts` / `.cts` files into standard TypeScript code.
- **Key Tasks:**
  - Develop `@chonkylang/babel-plugin` (or SWC plugin) to recognize and process the following syntax nodes:
    - `defineRequirement(...)` → Strip wrapper, output pure object, and generate independent JSON manifest file.
    - `machine:assert for "ID" { ... }` → Transform into Vitest/Jest test case code.
    - `with moduleCalls { ... }` → Preserve as comments or metadata for static analysis tools to read.
  - Implement automatic JSX component wrapping logic to inject render metadata collection hooks (development mode only).
  - Provide Source Map support to ensure debuggability of compiled code.
- **Deliverables:** `@chonkylang/transpiler` npm package, including the plugin itself and accompanying type definitions.

##### Milestone 1.3: Runtime Library and Browser-Side Infrastructure

- **Goal:** Provide essential browser-side runtime functionalities to support metadata collection, validation execution, and optimization components.
- **Key Tasks:**
  - Develop `@chonkylang/runtime` package, including:
    - `ChonkyRenderer` class: Responsible for collecting and maintaining `__CHONKY_RENDER_META__` data.
    - `Image` component: Integrated with resource optimization decision logic, reading silent mode thresholds from configuration.
    - `verify` runtime helper function: Used for assertion execution in development environment.
  - Develop a browser Developer Tools panel (Chonky DevTools) to visualize render metadata, dependency graphs, and requirement completion status.
- **Deliverables:** `@chonkylang/runtime` and `@chonkylang/devtools` npm packages.

##### Milestone 1.4: CLI Tool and Static Analyzer

- **Goal:** Provide a command-line entry point encapsulating build processes, dependency graph generation, and optimization prompt interactions.
- **Key Tasks:**
  - Develop `@chonkylang/cli`, providing the following commands:
    - `chonky init`: Interactively initialize a Chonky project (generates `chonky.config.js`, `tsconfig` extension, directory structure, and sample `.req.ts` files). Supports `--yes` flag for AI Agent silent invocation.
    - `chonky dev`: Start development server, inject runtime library, and enable metadata collection.
    - `chonky build`: Execute production build, automatically tree-shaking all debugging code.
    - `chonky graph`: Invoke static analyzer (based on TypeScript Compiler API or madge) to generate module dependency graph JSON.
    - `chonky optimize`: Interactively scan project resources, prompt based on silent mode thresholds, and execute optimizations.
  - Integrate Webpack / Vite plugins to lower the barrier for integration with mainstream build tools.
- **Deliverables:** `@chonkylang/cli` npm package, along with corresponding Vite/Webpack plugins.

##### Milestone 1.5: Semantic Translation View (Human Fallback Mechanism)

- **Goal:** Achieve real-time bidirectional conversion between "machine-first code" and "human-readable view," ensuring feasibility of emergency manual intervention.
- **Key Tasks:**
  - Develop `chonky view` subcommand to read Chonky source files and output beautified, highlighted TypeScript equivalent code with semantic naming.
  - Develop `chonky revert` subcommand, allowing developers to reverse-compile modified semantic code back to machine-optimized format (based on AST matching).
- **Deliverables:** CLI extension function modules with accompanying usage documentation.

##### Milestone 1.6: Integration Testing and Example Project

- **Goal:** Validate collaborative operation of all Phase 1 components and provide reproducible demonstration cases.
- **Key Tasks:**
  - Write end-to-end test cases covering the complete chain from requirement definition to render metadata reporting.
  - Build an example application called `Chonky TodoMVC`, fully written in Chonky syntax, showcasing features like requirement traceability and metadata debugging panel.
- **Deliverables:** Test reports, example repository, and corresponding online demo environment.

---

#### Phase 2: Rust Compiler Core and Autonomous Performance Tuning

**Overall Goal:**  
Rewrite the Chonky compiler core in Rust, replacing the Babel/SWC transpilation step to achieve an order-of-magnitude improvement in compilation speed, and on this foundation, enable "autonomous performance tuning" (automatic Wasm splitting, intelligent compositing layer assignment, and other advanced optimizations).

##### Milestone 2.1: Rust Compiler Architecture Design Document

- **Deliverables:**
  - *Chonky Compiler (Rust) Architecture Design Document*: Includes AST definition, parsing flow, type-checking integration approach (collaboration mode with TSC), incremental compilation strategy.
  - *Chonky Autonomous Performance Tuning Algorithm Specification*: Defines criteria for automatic function splitting, Wasm transformation trigger thresholds, and heuristic rules for compositing layer assignment.
- **Acceptance Criteria:** Documents pass technical review, clearly defining compatibility boundaries between the Rust compiler and the existing TypeScript ecosystem.

##### Milestone 2.2: Rust Parser and Basic Transpiler Implementation

- **Goal:** Implement parsing of `.chonky.ts` files and basic syntax transformation, achieving functional equivalence with the Phase 1 transpiler plugin.
- **Key Tasks:**
  - Build AST parser using `swc_ecma_parser` or `oxc`.
  - Implement AST transformation logic for extended syntax like `defineRequirement` and `machine:assert`.
  - Interact with the TypeScript type checker via FFI or language service protocol to ensure type safety.
- **Deliverables:** Executable Rust binary `chonkyc`, capable of compiling Chonky source code into standard TypeScript code.

##### Milestone 2.3: Extreme Performance Optimization Module Development

- **Goal:** Implement compile-time autonomous optimization capabilities unattainable in Phase 1.
- **Key Tasks:**
  - **Automatic Function Splitting:** Based on AST complexity analysis, mark long-running functions and automatically generate Web Worker or Wasm module wrapper code.
  - **Intelligent Compositing Layer Assignment:** During JSX compilation, analyze CSS properties related to animation and automatically inject `will-change` and compositing layer promotion code.
  - **Static Node Hoisting 2.0:** Identify and hoist static closure functions to reduce runtime memory allocation.
- **Deliverables:** Rust compiler version integrated with above optimizations, along with corresponding configuration switches.

##### Milestone 2.4: Toolchain Integration and Migration Guide

- **Goal:** Seamlessly integrate the Rust compiler into existing CLI tools and build plugin systems, ensuring a smooth upgrade path for users.
- **Key Tasks:**
  - Modify `@chonkylang/cli` to automatically detect and invoke the Rust compiler backend (via Node-API or subprocess).
  - Write *Migration Guide from Phase 1 to Phase 2*, detailing configuration changes and potential breaking changes.
- **Deliverables:** New version of CLI and build plugins, along with complete migration documentation.

##### Milestone 2.5: Performance Benchmarking and Official Release

- **Goal:** Quantify performance improvements brought by the Phase 2 compiler and officially release a production-ready version.
- **Key Tasks:**
  - Construct a large-scale simulated project with 10,000+ modules, comparing cold/hot compilation times between Phase 1 and Phase 2.
  - Measure first-screen loading optimization effects from automatic Wasm splitting in real-world applications.
- **Deliverables:** Performance whitepaper and official release announcement for Chonky v2.0.

---

### Roadmap Overview Diagram (Phase-Milestone Dependencies)

```
Phase 1 (npm packages)
├─ 1.1 Spec Documentation ◄── Prerequisite
├─ 1.2 Transpiler Plugin ──┐
├─ 1.3 Runtime Library ────┤ Parallelizable
├─ 1.4 CLI Tool ───────────┘
├─ 1.5 Semantic View
└─ 1.6 Integration Testing

Phase 2 (Rust Compiler)
├─ 2.1 Architecture Design ◄── Prerequisite
├─ 2.2 Parsing & Basic Transpilation
├─ 2.3 Extreme Performance Optimization
├─ 2.4 Toolchain Integration
└─ 2.5 Performance Benchmark & Release
```

This roadmap ensures each phase begins with clear documentation deliverables, subsequent implementation strictly adheres to design specifications, and reserves a clear path for evolution from lightweight npm packages to a high-performance Rust compiler.
# Chonky 静默模式与交互式询问阈值规范 v1.0

**文档版本：** v1.0  
**发布日期：** 2026-04-14  
**文档状态：** 初始发布  
**所属里程碑：** 1.1 — 核心规范与接口文档冻结

---

## 一、概述

本规范定义了 Chonky 工具链在资源优化环节中的**静默模式**与**交互式询问**机制。在 `chonky dev`、`chonky build` 和 `chonky optimize` 命令执行过程中，工具链会根据配置中的阈值自动决定是否静默执行优化，还是暂停并以终端交互的方式征求用户确认。本规范涵盖所有配置字段、默认阈值、询问模板以及用户选择的持久化策略。

---

## 二、术语表

| 术语 | 含义 |
| :--- | :--- |
| **静默模式 (Silent Mode)** | 满足阈值条件时自动执行优化，不暂停询问用户 |
| **交互式询问 (Interactive Prompt)** | 超出阈值或首次遇到新场景时暂停并向用户展示选项 |
| **阈值 (Threshold)** | 用于判定是否触发交互询问的数值边界 |
| **优化动作 (Optimization Action)** | 工具链可执行的单项资源优化操作 |
| **会话级选择 (Session Choice)** | 仅在当前命令执行期间生效的用户选择 |
| **持久化选择 (Persistent Choice)** | 写入配置文件、后续执行也遵循的用户选择 |

---

## 三、适用范围

本规范覆盖以下 CLI 命令中的资源优化环节：

| 命令 | 触发的优化类型 |
| :--- | :--- |
| `chonky dev` | 开发模式下的按需资源处理（轻量） |
| `chonky build` | 生产构建时的全量资源优化 |
| `chonky optimize` | 独立执行的交互式优化扫描 |

---

## 四、配置 Schema

### 4.1 配置位置

```javascript
// chonky.config.js
module.exports = {
  optimizer: {
    silentMode: { /* ... */ },
    interaction: { /* ... */ }
  }
};
```

### 4.2 `optimizer.silentMode` 完整定义

```typescript
interface SilentModeConfig {
  /**
   * 图片格式转换（如 PNG/JPEG -> WebP）是否静默执行
   * @default true
   */
  imageFormatConversion: boolean;

  /**
   * 图片尺寸缩减的静默阈值（0~1 之间的比例值）
   * 当预计体积缩减比例 ≤ 此值时静默执行，> 此值时询问用户
   * @default 0.3
   */
  sizeReductionThreshold: number;

  /**
   * 未使用资源检测后是否静默删除
   * @default false
   */
  unusedAssetRemoval: boolean;

  /**
   * CSS 合成层自动提升是否静默执行
   * 第一阶段仅标记（不自动执行 DOM 修改），故默认静默
   * @default true
   */
  compositeLayerPromotion: boolean;

  /**
   * 代码拆分建议是否静默应用
   * @default false
   */
  codeSplitSuggestion: boolean;

  /**
   * 全局静默开关：为 true 时所有优化动作均静默执行，不触发任何询问
   * 覆盖上述所有单项配置
   * @default false
   */
  all: boolean;
}
```

### 4.3 `optimizer.interaction` 完整定义

```typescript
interface InteractionConfig {
  /**
   * 交互超时时间（秒）：用户无响应时的默认行为
   * @default 30
   */
  timeoutSeconds: number;

  /**
   * 超时时的默认选择
   * @default "skip"
   */
  timeoutAction: "apply" | "skip" | "abort";

  /**
   * 是否在每次询问后提供"记住此选择"选项
   * @default true
   */
  offerPersistence: boolean;

  /**
   * 持久化方式
   * @default "config"
   */
  persistTo: "config" | "session";
}
```

### 4.4 完整配置示例

```javascript
// chonky.config.js
module.exports = {
  optimizer: {
    silentMode: {
      imageFormatConversion: true,
      sizeReductionThreshold: 0.3,
      unusedAssetRemoval: false,
      compositeLayerPromotion: true,
      codeSplitSuggestion: false,
      all: false
    },
    interaction: {
      timeoutSeconds: 30,
      timeoutAction: "skip",
      offerPersistence: true,
      persistTo: "config"
    }
  }
};
```

---

## 五、资源优化类型与默认阈值一览表

| 优化类型 | 标识键 | 静默条件 | 默认值 | 询问触发条件 |
| :--- | :--- | :--- | :--- | :--- |
| **图片格式转换** | `imageFormatConversion` | `true` = 始终静默 | `true` | 设为 `false` 时每次转换均询问 |
| **图片尺寸缩减** | `sizeReductionThreshold` | 预计缩减比 ≤ 阈值 | `0.3`（30%） | 预计缩减 > 30% 时询问 |
| **未使用资源删除** | `unusedAssetRemoval` | `true` = 静默删除 | `false` | 默认每次检测到均询问 |
| **CSS 合成层提升** | `compositeLayerPromotion` | `true` = 静默标记 | `true` | 设为 `false` 时标记前询问 |
| **代码拆分建议** | `codeSplitSuggestion` | `true` = 静默应用 | `false` | 默认每次均询问 |

### 5.1 图片格式转换

- **触发条件：** 构建时扫描到 PNG、JPEG、GIF 等非 WebP 格式图片
- **优化动作：** 通过 `sharp`（服务端）或 CDN 参数转换为 WebP，并重写引用
- **静默逻辑：** `imageFormatConversion === true` 时直接转换；`false` 时逐个询问

### 5.2 图片尺寸缩减

- **触发条件：** 图片文件体积超过一定阈值（默认 100KB）
- **优化动作：** 调整质量参数或分辨率以缩小体积
- **阈值逻辑：** 计算 `(originalSize - optimizedSize) / originalSize`
  - 结果 ≤ `sizeReductionThreshold` → 静默执行（优化收益小，不值得打扰）
  - 结果 > `sizeReductionThreshold` → 触发询问（优化幅度大，需用户确认质量可接受）

### 5.3 未使用资源删除

- **触发条件：** 静态分析检测到项目中存在未被引用的图片、字体等资源文件
- **优化动作：** 移动到 `.chonky/unused/` 暂存目录（非直接删除）
- **静默逻辑：** `unusedAssetRemoval === true` 时自动移动；`false` 时列出文件并逐个确认

### 5.4 CSS 合成层自动提升

- **触发条件：** 检测到含 `animation`、`transform`、`opacity` 变化的 CSS 规则
- **优化动作（第一阶段）：** 仅在编译输出中标记建议（注释形式），不自动注入 `will-change`
- **静默逻辑：** `compositeLayerPromotion === true` 时静默标记；`false` 时标记前询问

### 5.5 代码拆分建议

- **触发条件：** 检测到单个 bundle 体积超过阈值（默认 250KB gzip）或存在大型同步导入
- **优化动作：** 提出 dynamic import 拆分方案
- **静默逻辑：** `codeSplitSuggestion === true` 时自动修改代码；`false` 时展示方案并询问

---

## 六、交互式询问模板

所有终端交互使用 **Inquirer.js** 实现。以下是各类询问的标准模板。

### 6.1 图片格式转换询问

```
┌─────────────────────────────────────────────────────────┐
│  🖼  图片格式转换                                         │
│                                                         │
│  检测到以下图片可以转换为 WebP 格式:                        │
│                                                         │
│    src/assets/hero-banner.png  (2.4 MB → ~680 KB)       │
│    src/assets/logo.jpg         (150 KB → ~45 KB)        │
│                                                         │
│  ? 是否执行转换?                                         │
│                                                         │
│    ● 全部转换                                            │
│    ○ 逐个选择                                            │
│    ○ 跳过                                                │
│    ○ 全部跳过并记住此选择                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Inquirer.js 配置：**

```javascript
{
  type: "list",
  name: "imageFormatAction",
  message: "检测到可转换为 WebP 的图片，是否执行转换?",
  choices: [
    { name: "全部转换", value: "apply_all" },
    { name: "逐个选择", value: "select" },
    { name: "跳过", value: "skip" },
    { name: "全部跳过并记住此选择", value: "skip_persist" }
  ]
}
```

### 6.2 图片尺寸缩减询问

```
┌─────────────────────────────────────────────────────────┐
│  📐  图片尺寸优化                                        │
│                                                         │
│  以下图片的体积缩减幅度较大，建议确认质量是否可接受:         │
│                                                         │
│    src/assets/hero-banner.png                            │
│    原始: 2.4 MB → 优化后: 680 KB (缩减 72%)              │
│                                                         │
│  ? 请选择优化策略:                                       │
│                                                         │
│    ● 性能优先（最大压缩）                                 │
│    ○ 质量优先（最小压缩）                                 │
│    ○ 平衡模式                                            │
│    ○ 跳过此文件                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Inquirer.js 配置：**

```javascript
{
  type: "list",
  name: "sizeReductionStrategy",
  message: `图片 ${filePath} 可缩减 ${percent}%，请选择优化策略:`,
  choices: [
    { name: "性能优先（最大压缩）", value: "performance" },
    { name: "质量优先（最小压缩）", value: "quality" },
    { name: "平衡模式", value: "balanced" },
    { name: "跳过此文件", value: "skip" }
  ]
}
```

### 6.3 未使用资源删除询问

```
┌─────────────────────────────────────────────────────────┐
│  🗑  未使用资源检测                                       │
│                                                         │
│  以下资源文件未被任何代码引用:                              │
│                                                         │
│    ☐ src/assets/old-logo.png         (340 KB)           │
│    ☐ src/assets/unused-icon.svg      (12 KB)            │
│    ☐ src/fonts/legacy-font.woff2     (89 KB)            │
│                                                         │
│  ? 选择要移到暂存目录的文件:                               │
│    (空格选择，回车确认)                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Inquirer.js 配置：**

```javascript
{
  type: "checkbox",
  name: "unusedAssets",
  message: "以下资源未被引用，选择要移到暂存目录的文件:",
  choices: unusedFiles.map(f => ({
    name: `${f.relativePath}  (${f.sizeFormatted})`,
    value: f.absolutePath,
    checked: false
  }))
}
```

### 6.4 代码拆分建议询问

```
┌─────────────────────────────────────────────────────────┐
│  ✂️  代码拆分建议                                        │
│                                                         │
│  Bundle "main" 的 gzip 体积为 380 KB，超过建议阈值       │
│  (250 KB)。以下模块可以拆分为异步加载:                     │
│                                                         │
│    1. src/features/charts/ → dynamic import (预计 -95KB) │
│    2. src/features/admin/  → dynamic import (预计 -60KB) │
│                                                         │
│  ? 是否应用拆分?                                         │
│                                                         │
│    ● 全部应用                                            │
│    ○ 逐个选择                                            │
│    ○ 跳过                                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Inquirer.js 配置：**

```javascript
{
  type: "list",
  name: "codeSplitAction",
  message: `Bundle "${bundleName}" (${sizeFormatted}) 超过阈值，是否应用代码拆分?`,
  choices: [
    { name: "全部应用", value: "apply_all" },
    { name: "逐个选择", value: "select" },
    { name: "跳过", value: "skip" }
  ]
}
```

---

## 七、用户选择的持久化策略

### 7.1 会话级选择 (`persistTo: "session"`)

- 选择仅在当前命令执行期间有效
- 存储在内存中，命令结束后丢弃
- 适用于临时性选择（如"本次构建跳过所有图片优化"）

### 7.2 持久化选择 (`persistTo: "config"`)

当用户在询问中选择了带有"记住此选择"的选项时，工具链自动将对应配置写回 `chonky.config.js`：

```
用户选择 "全部跳过并记住此选择"
    │
    ▼
工具链修改 chonky.config.js:
  optimizer.silentMode.imageFormatConversion = false
    │
    ▼
下次执行时直接跳过，不再询问
```

### 7.3 持久化确认

写入配置前，工具链先输出确认提示：

```
? 将以下设置写入 chonky.config.js:
    optimizer.silentMode.imageFormatConversion: true → false
  确认? (Y/n)
```

---

## 八、`Image` 组件与静默模式的联动

`@chonky/ui` 提供的 `Image` 组件在构建时由 `@chonky/webpack-plugin`（或 Vite 插件）处理，其行为受静默模式配置影响：

### 8.1 构建时行为

```
Image 组件引用图片
    │
    ▼
Webpack/Vite 插件扫描引用
    │
    ├── imageFormatConversion = true
    │       → 自动生成 WebP 版本，重写 HTML 中的 <img> src
    │
    ├── imageFormatConversion = false
    │       → 触发询问（仅在 chonky optimize 时；build 时使用原格式）
    │
    └── sizeReductionThreshold 判断
            → 根据缩减比决定是否询问
```

### 8.2 运行时行为

`Image` 组件在运行时根据浏览器支持情况和配置选择最优格式：

```tsx
import { Image } from '@chonky/ui';

<Image src="/assets/hero.png" alt="Hero banner" />
```

编译后根据静默模式决策的结果，可能输出：

```html
<picture>
  <source srcset="/assets/hero.webp" type="image/webp" />
  <img src="/assets/hero.png" alt="Hero banner" />
</picture>
```

---

## 九、CI/CD 环境行为

在非交互式终端（如 CI/CD 流水线）中，Inquirer.js 无法接收用户输入。工具链的行为如下：

| 条件 | 行为 |
| :--- | :--- |
| 检测到 `CI=true` 环境变量 | 自动启用 `silentMode.all = true` |
| 检测到 `CHONKY_INTERACTIVE=false` | 自动启用 `silentMode.all = true` |
| `silentMode.all = true`（配置中显式设置） | 所有优化按默认策略静默执行 |
| 某项优化需要询问但处于非交互模式 | 执行 `interaction.timeoutAction` 指定的动作 |

---

## 十、完整场景示例

### 场景：生产构建中的资源优化

**配置：**

```javascript
module.exports = {
  optimizer: {
    silentMode: {
      imageFormatConversion: true,
      sizeReductionThreshold: 0.3,
      unusedAssetRemoval: false,
      all: false
    },
    interaction: {
      timeoutSeconds: 30,
      timeoutAction: "skip",
      offerPersistence: true,
      persistTo: "config"
    }
  }
};
```

**执行 `chonky build` 时的行为：**

1. **扫描到 `hero-banner.png`（2.4MB）**
   - 格式转换：`imageFormatConversion = true` → 静默转为 WebP
   - 尺寸缩减：预计缩减 72% > 30% 阈值 → 触发询问
   - 用户选择"性能优先" → 应用最大压缩

2. **扫描到 `icon-small.png`（15KB）**
   - 格式转换：静默转为 WebP
   - 尺寸缩减：预计缩减 20% ≤ 30% 阈值 → 静默执行

3. **检测到 `old-logo.png` 未被引用**
   - `unusedAssetRemoval = false` → 触发询问
   - 用户选择移到暂存目录

4. **构建完成**，输出优化摘要：

```
✓ 图片格式转换: 3 个文件 → WebP (静默)
✓ 图片尺寸优化: hero-banner.png 2.4MB → 680KB (用户选择: 性能优先)
✓ 图片尺寸优化: icon-small.png 15KB → 12KB (静默)
✓ 未使用资源: old-logo.png → .chonky/unused/ (用户确认)
```

---

## 十一、变更记录

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | 初始版本发布 |

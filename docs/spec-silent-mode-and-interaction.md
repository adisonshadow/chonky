# Chonky Silent Mode and Interactive Prompts v1.0

**Document version:** v1.0  
**Published:** 2026-04-14  
**Status:** Initial release  
**Milestone:** 1.1 — Core specifications and API freeze

---

## 1. Overview

This specification defines **silent mode** and **interactive prompts** for Chonky’s optimization pipeline during `chonky dev`, `chonky build`, and `chonky optimize`. The toolchain compares estimated impact against configured thresholds to decide whether to run optimizations without asking, or to pause and prompt in the terminal. It covers all config fields, defaults, prompt templates, and how user choices are remembered.

---

## 2. Glossary

| Term | Meaning |
| :--- | :--- |
| **Silent mode** | Optimizations run automatically when thresholds are satisfied |
| **Interactive prompt** | Terminal UI when impact exceeds a threshold or a scenario is new |
| **Threshold** | Numeric boundary for deciding whether to prompt |
| **Optimization action** | One kind of resource optimization the toolchain may perform |
| **Session choice** | Applies only for the current command invocation |
| **Persistent choice** | Written to config and reused on later runs |

---

## 3. Scope

| Command | Optimization context |
| :--- | :--- |
| `chonky dev` | Lightweight on-demand handling in dev |
| `chonky build` | Full production optimizations |
| `chonky optimize` | Standalone interactive optimization pass |

---

## 4. Configuration schema

### 4.1 Location

```javascript
// chonky.config.js
module.exports = {
  optimizer: {
    silentMode: { /* ... */ },
    interaction: { /* ... */ }
  }
};
```

### 4.2 `optimizer.silentMode`

```typescript
interface SilentModeConfig {
  /**
   * Silent image format conversion (e.g. PNG/JPEG → WebP).
   * @default true
   */
  imageFormatConversion: boolean;

  /**
   * If estimated size reduction ratio ≤ this value (0–1), run silently; else prompt.
   * @default 0.3
   */
  sizeReductionThreshold: number;

  /**
   * Silent removal of unused assets after detection.
   * @default false
   */
  unusedAssetRemoval: boolean;

  /**
   * Silent CSS compositing hints (phase 1 may annotate only).
   * @default true
   */
  compositeLayerPromotion: boolean;

  /**
   * Silent application of code-split suggestions.
   * @default false
   */
  codeSplitSuggestion: boolean;

  /**
   * Master switch: all optimizations silent, no prompts.
   * @default false
   */
  all: boolean;
}
```

### 4.3 `optimizer.interaction`

```typescript
interface InteractionConfig {
  /** Seconds to wait for user input before timeout. @default 30 */
  timeoutSeconds: number;

  /** Action on timeout. @default "skip" */
  timeoutAction: "apply" | "skip" | "abort";

  /** Offer “remember this choice” after prompts. @default true */
  offerPersistence: boolean;

  /** Where to persist choices. @default "config" */
  persistTo: "config" | "session";
}
```

### 4.4 Example

```javascript
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

## 5. Optimization types and defaults

| Type | Key | Silent when | Default | Prompt when |
| :--- | :--- | :--- | :--- | :--- |
| Image format | `imageFormatConversion` | `true` = always silent | `true` | If `false`, prompt each conversion |
| Image resize | `sizeReductionThreshold` | Estimated reduction ≤ threshold | `0.3` | If reduction > 30%, prompt |
| Unused assets | `unusedAssetRemoval` | `true` = silent move/delete | `false` | By default prompt |
| CSS layers | `compositeLayerPromotion` | `true` = silent annotate | `true` | If `false`, prompt before annotate |
| Code split | `codeSplitSuggestion` | `true` = silent apply | `false` | By default prompt |

### 5.1 Image format conversion

- **Trigger:** PNG, JPEG, GIF, etc. detected at build.  
- **Action:** Convert to WebP (e.g. via `sharp` or CDN) and rewrite references.  
- **Silent:** `imageFormatConversion === true` converts without asking; `false` prompts per file or batch.  

### 5.2 Image resize

- **Trigger:** File over default size threshold (e.g. 100KB).  
- **Action:** Adjust quality or dimensions.  
- **Logic:** `ratio = (originalSize - optimizedSize) / originalSize`  
  - `ratio ≤ sizeReductionThreshold` → silent (small gain, not worth interrupting)  
  - `ratio > threshold` → prompt (large change, confirm quality tradeoff)  

### 5.3 Unused assets

- **Trigger:** Static analysis finds unreferenced images/fonts.  
- **Action:** Move to `.chonky/unused/` staging (not hard delete by default).  
- **Silent:** `unusedAssetRemoval === true` auto-moves; `false` lists files and asks.  

### 5.4 CSS compositing hints

- **Trigger:** Rules with `animation`, `transform`, `opacity` transitions.  
- **Phase 1:** Emit comments / markers only, no automatic `will-change` injection.  
- **Silent:** `compositeLayerPromotion === true` annotates silently; `false` may prompt first.  

### 5.5 Code splitting

- **Trigger:** Bundle over gzip threshold (e.g. 250KB) or large sync imports.  
- **Action:** Suggest `import()` boundaries.  
- **Silent:** `codeSplitSuggestion === true` may apply edits; `false` shows plan and asks.  

---

## 6. Prompt templates (Inquirer.js)

All interactive flows use **Inquirer.js**. Below are canonical English templates.

### 6.1 Image format conversion

```
┌─────────────────────────────────────────────────────────┐
│  Image format conversion                                 │
│                                                         │
│  The following images can be converted to WebP:          │
│                                                         │
│    src/assets/hero-banner.png  (2.4 MB → ~680 KB)         │
│    src/assets/logo.jpg         (150 KB → ~45 KB)        │
│                                                         │
│  ? Convert?                                              │
│                                                         │
│    ● Convert all                                        │
│    ○ Choose individually                                │
│    ○ Skip                                               │
│    ○ Skip all and remember                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```javascript
{
  type: "list",
  name: "imageFormatAction",
  message: "Images can be converted to WebP. Proceed?",
  choices: [
    { name: "Convert all", value: "apply_all" },
    { name: "Choose individually", value: "select" },
    { name: "Skip", value: "skip" },
    { name: "Skip all and remember", value: "skip_persist" }
  ]
}
```

### 6.2 Image resize

```
┌─────────────────────────────────────────────────────────┐
│  Image size optimization                                 │
│                                                         │
│  Large size reduction — confirm quality tradeoff:       │
│                                                         │
│    src/assets/hero-banner.png                           │
│    Original: 2.4 MB → Optimized: 680 KB (−72%)           │
│                                                         │
│  ? Strategy:                                             │
│                                                         │
│    ● Performance (max compression)                      │
│    ○ Quality (minimal compression)                      │
│    ○ Balanced                                           │
│    ○ Skip this file                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```javascript
{
  type: "list",
  name: "sizeReductionStrategy",
  message: `Image ${filePath} can shrink by ${percent}%. Choose strategy:`,
  choices: [
    { name: "Performance (max compression)", value: "performance" },
    { name: "Quality (minimal compression)", value: "quality" },
    { name: "Balanced", value: "balanced" },
    { name: "Skip this file", value: "skip" }
  ]
}
```

### 6.3 Unused assets

```
┌─────────────────────────────────────────────────────────┐
│  Unused assets                                           │
│                                                         │
│  The following files are not referenced:                  │
│                                                         │
│    ☐ src/assets/old-logo.png         (340 KB)           │
│    ☐ src/assets/unused-icon.svg      (12 KB)            │
│    ☐ src/fonts/legacy-font.woff2     (89 KB)            │
│                                                         │
│  ? Select files to move to staging (space, enter):       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```javascript
{
  type: "checkbox",
  name: "unusedAssets",
  message: "Select unreferenced assets to move to staging:",
  choices: unusedFiles.map(f => ({
    name: `${f.relativePath}  (${f.sizeFormatted})`,
    value: f.absolutePath,
    checked: false
  }))
}
```

### 6.4 Code splitting

```
┌─────────────────────────────────────────────────────────┐
│  Code splitting                                          │
│                                                         │
│  Bundle "main" is 380 KB gzip (threshold 250 KB).       │
│  Candidates for async import:                           │
│                                                         │
│    1. src/features/charts/ → dynamic import (~−95 KB)    │
│    2. src/features/admin/  → dynamic import (~−60 KB)    │
│                                                         │
│  ? Apply splits?                                         │
│                                                         │
│    ● Apply all                                          │
│    ○ Choose individually                                │
│    ○ Skip                                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```javascript
{
  type: "list",
  name: "codeSplitAction",
  message: `Bundle "${bundleName}" (${sizeFormatted}) exceeds threshold. Apply code splitting?`,
  choices: [
    { name: "Apply all", value: "apply_all" },
    { name: "Choose individually", value: "select" },
    { name: "Skip", value: "skip" }
  ]
}
```

---

## 7. Persisting user choices

### 7.1 Session (`persistTo: "session"`)

- Choices apply only for the current CLI process.  
- Discarded when the command exits.  
- Good for one-off behavior (“skip all image work this run”).  

### 7.2 Config (`persistTo: "config"`)

When the user picks a “remember” option, the toolchain may patch `chonky.config.js`:

```
User selects "Skip all and remember"
    │
    ▼
Toolchain updates chonky.config.js:
  optimizer.silentMode.imageFormatConversion = false
    │
    ▼
Next run skips prompts for that action
```

### 7.3 Confirmation before write

```
? Write the following to chonky.config.js:
    optimizer.silentMode.imageFormatConversion: true → false
  Confirm? (Y/n)
```

---

## 8. `Image` component and silent mode

`Image` from `@chonkylang/ui` is processed by `@chonkylang/webpack-plugin` (or the Vite equivalent). Behavior follows `optimizer.silentMode`.

### 8.1 Build-time

```
Image references a raster file
    │
    ▼
Bundler plugin scans
    │
    ├── imageFormatConversion = true
    │       → emit WebP, rewrite src / picture
    │
    ├── imageFormatConversion = false
    │       → may prompt (e.g. during optimize); build may keep original
    │
    └── sizeReductionThreshold
            → silent vs prompt from estimated ratio
```

### 8.2 Runtime

```tsx
import { Image } from '@chonkylang/ui';

<Image src="/assets/hero.png" alt="Hero banner" />
```

After build-time decisions, output may resemble:

```html
<picture>
  <source srcset="/assets/hero.webp" type="image/webp" />
  <img src="/assets/hero.png" alt="Hero banner" />
</picture>
```

---

## 9. CI / non-interactive environments

In CI, Inquirer cannot read a TTY. Behavior:

| Condition | Behavior |
| :--- | :--- |
| `CI=true` | Treat as `silentMode.all = true` |
| `CHONKY_INTERACTIVE=false` | Treat as `silentMode.all = true` |
| `silentMode.all = true` in config | All optimizations use defaults, no prompts |
| Prompt needed but non-interactive | Use `interaction.timeoutAction` |

---

## 10. Scenario: production build

**Config:**

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

**During `chonky build`:**

1. **`hero-banner.png` (2.4 MB)**  
   - Format: silent WebP (`imageFormatConversion`)  
   - Resize: ~72% reduction > 30% → prompt → user picks “Performance”  

2. **`icon-small.png` (15 KB)**  
   - Format: silent WebP  
   - Resize: ~20% ≤ 30% → silent  

3. **`old-logo.png` unreferenced**  
   - `unusedAssetRemoval = false` → prompt → user confirms move to staging  

4. **Summary**

```
✓ Image format: 3 files → WebP (silent)
✓ Image resize: hero-banner.png 2.4MB → 680KB (user: performance)
✓ Image resize: icon-small.png 15KB → 12KB (silent)
✓ Unused asset: old-logo.png → .chonky/unused/ (user confirmed)
```

---

## 11. Changelog

| Version | Date | Notes |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | Initial release |

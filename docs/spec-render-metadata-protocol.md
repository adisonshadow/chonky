# Chonky 渲染元数据协议 v1.0

**文档版本：** v1.0  
**发布日期：** 2026-04-14  
**文档状态：** 初始发布  
**所属里程碑：** 1.1 — 核心规范与接口文档冻结

---

## 一、概述

本规范定义了 Chonky 渲染元数据协议（Render Metadata Protocol）的完整数据结构、注入机制、生命周期收集逻辑和查询接口。该协议通过在构建阶段对 JSX 组件进行自动包裹，在开发环境运行时收集组件渲染信息并存储到 `window.__CHONKY_RENDER_META__` 全局对象中，为 AI Agent 调试、DevTools 面板可视化以及渲染行为分析提供数据基础。

---

## 二、术语表

| 术语 | 含义 |
| :--- | :--- |
| **渲染元数据 (Render Metadata)** | 组件每次 mount/update/unmount 时收集的结构化信息 |
| **Chonky Wrapper** | Babel 插件自动注入的高阶组件 `_ChonkyWrapper`，用于拦截并收集渲染事件 |
| **Chonky ID** | 编译时为每个 JSX 元素分配的稳定唯一标识符 |
| **ChonkyRenderer** | `@chonkylang/runtime` 提供的核心类，负责元数据的收集、存储与查询 |
| **DevTools 面板** | 浏览器开发者工具扩展，消费渲染元数据进行可视化展示 |

---

## 三、核心数据结构

### 3.1 全局对象 `window.__CHONKY_RENDER_META__`

```typescript
interface ChonkyRenderMeta {
  /** 组件注册表：按 chonkyId 索引的组件信息 */
  components: Record<string, ComponentEntry>;

  /** 渲染事件流：按时间顺序记录的渲染事件 */
  events: RenderEvent[];

  /** 组件树快照：最近一次完整渲染的树形结构 */
  tree: ComponentTreeNode | null;

  /** 协议版本 */
  version: string;
}
```

### 3.2 `ComponentEntry` — 组件注册信息

```typescript
interface ComponentEntry {
  /** 编译时分配的稳定标识符 */
  chonkyId: string;

  /** 组件名称（函数名或 displayName） */
  componentName: string;

  /** 源文件路径（相对项目根目录） */
  sourceFile: string;

  /** 源文件中的行号 */
  sourceLine: number;

  /** 组件实例列表（同一组件可能有多个实例） */
  instances: ComponentInstance[];
}
```

### 3.3 `ComponentInstance` — 组件实例

```typescript
interface ComponentInstance {
  /** 实例唯一标识（运行时生成，每次 mount 分配） */
  instanceId: string;

  /** 父组件的 chonkyId（顶层组件为 null） */
  parentChonkyId: string | null;

  /** 当前 props 快照 */
  currentProps: Record<string, unknown>;

  /** 最近一次渲染时间戳（ms） */
  lastRenderAt: number;

  /** 累计渲染次数 */
  renderCount: number;

  /** 当前挂载状态 */
  status: "mounted" | "unmounted";
}
```

### 3.4 `RenderEvent` — 渲染事件

```typescript
interface RenderEvent {
  /** 事件类型 */
  type: "mount" | "update" | "unmount";

  /** 关联的 chonkyId */
  chonkyId: string;

  /** 关联的 instanceId */
  instanceId: string;

  /** 事件发生时间戳（ms） */
  timestamp: number;

  /** 本次渲染的 props（unmount 时为上一次 props） */
  props: Record<string, unknown>;

  /** update 事件专有：变更的 prop keys */
  changedProps?: string[];

  /** 渲染耗时（ms，仅 mount 和 update） */
  duration?: number;
}
```

### 3.5 `ComponentTreeNode` — 组件树节点

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

## 四、元数据注入机制

### 4.1 Babel 插件转换规则

`@chonkylang/babel-plugin` 在编译阶段对所有 JSX 元素执行以下转换：

**源代码：**

```tsx
<Button onClick={handleSubmit}>提交</Button>
```

**开发环境编译后：**

```tsx
<_ChonkyWrapper
  __chonkyId="btn_a1b2c3"
  __componentName="Button"
  __sourceFile="src/features/auth/LoginForm.tsx"
  __sourceLine={42}
>
  <Button onClick={handleSubmit}>提交</Button>
</_ChonkyWrapper>
```

### 4.2 Chonky ID 生成规则

Chonky ID 在编译时确定性生成，确保同一源码位置在多次编译间保持稳定：

```
<componentNameAbbrev>_<hash6>
```

- `componentNameAbbrev`：组件名小写的前 3-6 个字符
- `hash6`：基于 `sourceFile + sourceLine + componentName` 的 6 位十六进制哈希

示例：`btn_a1b2c3`、`input_f4e5d6`、`modal_1a2b3c`

### 4.3 注入属性

`_ChonkyWrapper` 接收以下内部属性（均以双下划线前缀，避免与用户 props 冲突）：

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `__chonkyId` | `string` | 编译时确定的稳定标识 |
| `__componentName` | `string` | 组件名称 |
| `__sourceFile` | `string` | 源文件相对路径 |
| `__sourceLine` | `number` | 源文件行号 |

### 4.4 DOM 属性注入

`_ChonkyWrapper` 在渲染时向被包裹组件的根 DOM 元素注入 `data-chonky-id` 属性：

```html
<button data-chonky-id="btn_a1b2c3" class="submit-btn">提交</button>
```

### 4.5 环境隔离

| 环境 | 行为 |
| :--- | :--- |
| **开发环境** (`NODE_ENV=development`) | 完整注入 `_ChonkyWrapper`，启用元数据收集 |
| **生产环境** (`NODE_ENV=production`) | Babel 插件不注入包裹代码；`@chonkylang/runtime` 中的收集逻辑被 Tree-Shaking 移除 |

生产构建零开销：不增加任何包体积和运行时性能损耗。

---

## 五、生命周期收集逻辑

### 5.1 Mount 阶段

当 `_ChonkyWrapper` 首次渲染（`useEffect` 初始调用）时：

1. 生成 `instanceId`（UUID v4 短格式）
2. 在 `components[chonkyId].instances` 中注册新实例
3. 记录 `RenderEvent { type: "mount", props, timestamp }`
4. 更新组件树快照

### 5.2 Update 阶段

当被包裹组件的 props 发生变更触发重渲染时：

1. 对比前后 props，计算 `changedProps` 列表
2. 更新 `ComponentInstance.currentProps` 和 `lastRenderAt`
3. `renderCount` 递增
4. 记录 `RenderEvent { type: "update", changedProps, duration }`

### 5.3 Unmount 阶段

当 `_ChonkyWrapper` 卸载（`useEffect` cleanup）时：

1. 将实例 `status` 设为 `"unmounted"`
2. 记录 `RenderEvent { type: "unmount", props: lastProps }`
3. 从组件树快照中移除该节点

### 5.4 事件缓冲区

为避免高频更新导致内存膨胀，`events` 数组采用环形缓冲策略：

- **默认容量：** 最近 2000 条事件
- **溢出策略：** 丢弃最早的事件
- **可配置：** 通过 `ChonkyRenderer.setEventBufferSize(n)` 调整

---

## 六、`ChonkyRenderer` 查询接口

`ChonkyRenderer` 是 `@chonkylang/runtime` 导出的单例类，提供以下公开方法：

### 6.1 组件查询

```typescript
class ChonkyRenderer {
  /** 获取完整组件树（最近快照） */
  getComponentTree(): ComponentTreeNode | null;

  /** 按组件名查询所有实例 */
  queryByName(componentName: string): ComponentInstance[];

  /** 按 chonkyId 查询组件信息 */
  getComponent(chonkyId: string): ComponentEntry | null;

  /** 按 chonkyId 查询指定组件的所有实例 */
  getInstances(chonkyId: string): ComponentInstance[];
}
```

### 6.2 事件查询

```typescript
class ChonkyRenderer {
  /** 获取指定组件的渲染事件历史 */
  getEvents(chonkyId: string): RenderEvent[];

  /** 按时间范围过滤事件 */
  getEventsByTimeRange(startMs: number, endMs: number): RenderEvent[];

  /** 获取渲染次数最多的 N 个组件（性能热点分析） */
  getHotComponents(topN: number): Array<{ chonkyId: string; renderCount: number }>;
}
```

### 6.3 导出与重置

```typescript
class ChonkyRenderer {
  /** 导出全部元数据为 JSON（供外部工具消费） */
  export(): ChonkyRenderMeta;

  /** 清空所有收集数据 */
  reset(): void;

  /** 设置事件缓冲区大小 */
  setEventBufferSize(size: number): void;
}
```

---

## 七、与 DevTools 面板的通信

### 7.1 通信方式

`ChonkyRenderer` 通过 `window.postMessage` 向 DevTools 面板推送数据更新：

```typescript
window.postMessage({
  source: "chonky-runtime",
  type: "RENDER_EVENT",
  payload: renderEvent
}, "*");
```

### 7.2 消息类型

| `type` | 触发时机 | `payload` |
| :--- | :--- | :--- |
| `RENDER_EVENT` | 每次 mount/update/unmount | `RenderEvent` |
| `TREE_SNAPSHOT` | 组件树发生结构变化后 | `ComponentTreeNode` |
| `FULL_SYNC` | DevTools 面板首次连接或请求全量同步 | `ChonkyRenderMeta` |

### 7.3 DevTools 到运行时的请求

DevTools 面板通过同一通道发送请求：

```typescript
window.postMessage({
  source: "chonky-devtools",
  type: "REQUEST_FULL_SYNC"
}, "*");
```

---

## 八、完整示例

### 8.1 源代码

```tsx
// src/features/auth/LoginForm.tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  return (
    <form>
      <Input value={email} onChange={setEmail} placeholder="请输入邮箱" />
      <Button onClick={handleLogin}>登录</Button>
    </form>
  );
}
```

### 8.2 开发环境编译后

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  return (
    <_ChonkyWrapper __chonkyId="form_c8d9e0" __componentName="form" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={4}>
      <form>
        <_ChonkyWrapper __chonkyId="input_a1b2c3" __componentName="Input" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={5}>
          <Input value={email} onChange={setEmail} placeholder="请输入邮箱" />
        </_ChonkyWrapper>
        <_ChonkyWrapper __chonkyId="btn_d4e5f6" __componentName="Button" __sourceFile="src/features/auth/LoginForm.tsx" __sourceLine={6}>
          <Button onClick={handleLogin}>登录</Button>
        </_ChonkyWrapper>
      </form>
    </_ChonkyWrapper>
  );
}
```

### 8.3 运行时 `__CHONKY_RENDER_META__` 数据示例

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
          "currentProps": { "onClick": "[Function]", "children": "登录" },
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
      "props": { "onClick": "[Function]", "children": "登录" },
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
        "props": { "value": "", "placeholder": "请输入邮箱" },
        "children": []
      },
      {
        "chonkyId": "btn_d4e5f6",
        "componentName": "Button",
        "instanceId": "i_7f8a9b",
        "props": { "children": "登录" },
        "children": []
      }
    ]
  }
}
```

---

## 九、变更记录

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v1.0 | 2026-04-14 | 初始版本发布 |

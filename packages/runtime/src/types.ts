export interface ComponentEntry {
  chonkyId: string;
  componentName: string;
  sourceFile: string;
  sourceLine: number;
  instances: ComponentInstance[];
}

export interface ComponentInstance {
  instanceId: string;
  parentChonkyId: string | null;
  currentProps: Record<string, unknown>;
  lastRenderAt: number;
  renderCount: number;
  status: 'mounted' | 'unmounted';
}

export interface RenderEvent {
  type: 'mount' | 'update' | 'unmount';
  chonkyId: string;
  instanceId: string;
  timestamp: number;
  props: Record<string, unknown>;
  changedProps?: string[];
  duration?: number;
}

export interface ComponentTreeNode {
  chonkyId: string;
  componentName: string;
  instanceId: string;
  props: Record<string, unknown>;
  children: ComponentTreeNode[];
}

export interface ChonkyRenderMeta {
  components: Record<string, ComponentEntry>;
  events: RenderEvent[];
  tree: ComponentTreeNode | null;
  version: string;
}

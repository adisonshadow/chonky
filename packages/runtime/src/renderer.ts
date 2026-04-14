import type {
  ChonkyRenderMeta,
  ComponentEntry,
  ComponentInstance,
  ComponentTreeNode,
  RenderEvent,
} from './types';

const DEFAULT_EVENT_BUFFER_SIZE = 2000;
const META_VERSION = '1.0';

declare const window: {
  __CHONKY_RENDER_META__?: ChonkyRenderMeta;
  postMessage?: (msg: unknown, target: string) => void;
} | undefined;

export class ChonkyRenderer {
  private meta: ChonkyRenderMeta;
  private eventBufferSize: number = DEFAULT_EVENT_BUFFER_SIZE;
  private static instance: ChonkyRenderer | null = null;

  private constructor() {
    this.meta = {
      components: {},
      events: [],
      tree: null,
      version: META_VERSION,
    };

    if (typeof window !== 'undefined') {
      window.__CHONKY_RENDER_META__ = this.meta;
    }
  }

  static getInstance(): ChonkyRenderer {
    if (!ChonkyRenderer.instance) {
      ChonkyRenderer.instance = new ChonkyRenderer();
    }
    return ChonkyRenderer.instance;
  }

  // --- Registration ---

  registerComponent(
    chonkyId: string,
    componentName: string,
    sourceFile: string,
    sourceLine: number,
  ): void {
    if (!this.meta.components[chonkyId]) {
      this.meta.components[chonkyId] = {
        chonkyId,
        componentName,
        sourceFile,
        sourceLine,
        instances: [],
      };
    }
  }

  registerInstance(
    chonkyId: string,
    instanceId: string,
    parentChonkyId: string | null,
    props: Record<string, unknown>,
  ): void {
    const component = this.meta.components[chonkyId];
    if (!component) return;

    const instance: ComponentInstance = {
      instanceId,
      parentChonkyId,
      currentProps: sanitizeProps(props),
      lastRenderAt: Date.now(),
      renderCount: 1,
      status: 'mounted',
    };
    component.instances.push(instance);

    this.pushEvent({
      type: 'mount',
      chonkyId,
      instanceId,
      timestamp: Date.now(),
      props: instance.currentProps,
    });
  }

  recordUpdate(
    chonkyId: string,
    instanceId: string,
    props: Record<string, unknown>,
    changedProps: string[],
    duration?: number,
  ): void {
    const instance = this.findInstance(chonkyId, instanceId);
    if (!instance) return;

    instance.currentProps = sanitizeProps(props);
    instance.lastRenderAt = Date.now();
    instance.renderCount++;

    this.pushEvent({
      type: 'update',
      chonkyId,
      instanceId,
      timestamp: Date.now(),
      props: instance.currentProps,
      changedProps,
      duration,
    });
  }

  recordUnmount(chonkyId: string, instanceId: string): void {
    const instance = this.findInstance(chonkyId, instanceId);
    if (!instance) return;

    instance.status = 'unmounted';

    this.pushEvent({
      type: 'unmount',
      chonkyId,
      instanceId,
      timestamp: Date.now(),
      props: instance.currentProps,
    });
  }

  // --- Query API ---

  getComponentTree(): ComponentTreeNode | null {
    return this.meta.tree;
  }

  queryByName(componentName: string): ComponentInstance[] {
    const results: ComponentInstance[] = [];
    for (const entry of Object.values(this.meta.components)) {
      if (entry.componentName === componentName) {
        results.push(...entry.instances);
      }
    }
    return results;
  }

  getComponent(chonkyId: string): ComponentEntry | null {
    return this.meta.components[chonkyId] ?? null;
  }

  getInstances(chonkyId: string): ComponentInstance[] {
    return this.meta.components[chonkyId]?.instances ?? [];
  }

  getEvents(chonkyId: string): RenderEvent[] {
    return this.meta.events.filter((e) => e.chonkyId === chonkyId);
  }

  getEventsByTimeRange(startMs: number, endMs: number): RenderEvent[] {
    return this.meta.events.filter(
      (e) => e.timestamp >= startMs && e.timestamp <= endMs,
    );
  }

  getHotComponents(topN: number): Array<{ chonkyId: string; renderCount: number }> {
    const counts = new Map<string, number>();
    for (const entry of Object.values(this.meta.components)) {
      let total = 0;
      for (const inst of entry.instances) {
        total += inst.renderCount;
      }
      counts.set(entry.chonkyId, total);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([chonkyId, renderCount]) => ({ chonkyId, renderCount }));
  }

  // --- Export & Reset ---

  export(): ChonkyRenderMeta {
    return structuredClone(this.meta);
  }

  reset(): void {
    this.meta.components = {};
    this.meta.events = [];
    this.meta.tree = null;
  }

  setEventBufferSize(size: number): void {
    this.eventBufferSize = size;
    while (this.meta.events.length > this.eventBufferSize) {
      this.meta.events.shift();
    }
  }

  updateTree(tree: ComponentTreeNode | null): void {
    this.meta.tree = tree;
    this.postMessage({ source: 'chonky-runtime', type: 'TREE_SNAPSHOT', payload: tree });
  }

  // --- Internal ---

  private findInstance(
    chonkyId: string,
    instanceId: string,
  ): ComponentInstance | undefined {
    return this.meta.components[chonkyId]?.instances.find(
      (i) => i.instanceId === instanceId,
    );
  }

  private pushEvent(event: RenderEvent): void {
    this.meta.events.push(event);
    if (this.meta.events.length > this.eventBufferSize) {
      this.meta.events.shift();
    }
    this.postMessage({ source: 'chonky-runtime', type: 'RENDER_EVENT', payload: event });
  }

  private postMessage(msg: unknown): void {
    if (typeof window !== 'undefined' && window.postMessage) {
      try {
        window.postMessage(msg, '*');
      } catch { /* swallow in non-browser environments */ }
    }
  }
}

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      result[key] = '[Function]';
    } else if (typeof value === 'object' && value !== null) {
      try {
        JSON.stringify(value);
        result[key] = value;
      } catch {
        result[key] = '[Circular]';
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

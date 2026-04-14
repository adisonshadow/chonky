export interface DevToolsMessage {
  source: 'chonky-devtools' | 'chonky-runtime';
  type: string;
  payload: unknown;
}

export interface DevToolsState {
  connected: boolean;
  lastEventTimestamp: number;
  eventCount: number;
}

declare const window: {
  addEventListener: (type: string, handler: (event: { data: unknown }) => void) => void;
  removeEventListener: (type: string, handler: (event: { data: unknown }) => void) => void;
  postMessage: (msg: unknown, target: string) => void;
} | undefined;

/**
 * Lightweight bridge between Chrome DevTools panel and the runtime.
 * Listens for postMessage from @chonky/runtime and provides
 * a command channel for DevTools to request data/actions.
 */
export class DevToolsBridge {
  private state: DevToolsState = {
    connected: false,
    lastEventTimestamp: 0,
    eventCount: 0,
  };
  private messageHandler: ((event: { data: unknown }) => void) | null = null;
  private listeners = new Map<string, Set<(msg: DevToolsMessage) => void>>();

  connect(): void {
    if (typeof window === 'undefined') return;
    if (this.state.connected) return;

    this.messageHandler = (event) => {
      const data = event.data;
      if (!isDevToolsMessage(data)) return;
      this.state.lastEventTimestamp = Date.now();
      this.state.eventCount++;
      this.emit(data.type, data);
    };

    window.addEventListener('message', this.messageHandler);
    this.state.connected = true;
  }

  disconnect(): void {
    if (typeof window === 'undefined') return;
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.state.connected = false;
  }

  send(type: string, payload: unknown): void {
    if (typeof window === 'undefined') return;
    const msg: DevToolsMessage = {
      source: 'chonky-devtools',
      type,
      payload,
    };
    window.postMessage(msg, '*');
  }

  on(type: string, handler: (msg: DevToolsMessage) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  getState(): DevToolsState {
    return { ...this.state };
  }

  private emit(type: string, msg: DevToolsMessage): void {
    this.listeners.get(type)?.forEach((handler) => handler(msg));
    this.listeners.get('*')?.forEach((handler) => handler(msg));
  }
}

function isDevToolsMessage(data: unknown): data is DevToolsMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    (obj.source === 'chonky-devtools' || obj.source === 'chonky-runtime') &&
    typeof obj.type === 'string'
  );
}

import type { DesignServerMsg } from '../src/shared/design/protocol.ts';

/**
 * Opens the design socket like a browser on `origin` (or like a non-browser client when undefined) and resolves with
 * the first `welcome` or `error`. Uses Bun's native WebSocket: the `ws` package ignores an `origin` option under Bun.
 */
export function designHello(wsUrl: string, origin: string | undefined, hello: Record<string, unknown>): Promise<DesignServerMsg> {
  return new Promise((resolve, reject) => {
    const ws = new globalThis.WebSocket(wsUrl, origin ? ({ headers: { origin } } as never) : undefined);
    ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', ...hello }));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data)) as DesignServerMsg;
      if (m.t === 'welcome' || m.t === 'error') {
        ws.close();
        resolve(m);
      }
    };
    ws.onerror = () => reject(new Error('socket error'));
  });
}

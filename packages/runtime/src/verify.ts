declare const window: { __CHONKY_LOGS__?: Array<{ requirementId: string; error: string; timestamp: number }> } | undefined;

/**
 * Runtime assertion helper. In development, executes the assertion and
 * logs failures to window.__CHONKY_LOGS__. In production, this is a no-op
 * and gets removed by tree-shaking.
 */
export function verify(
  requirementId: string,
  assertion: () => void | Promise<void>,
): void {
  if (process.env.NODE_ENV === 'production') return;

  try {
    const result = assertion();
    if (result instanceof Promise) {
      result.catch((err) => logVerifyError(requirementId, err));
    }
  } catch (err) {
    logVerifyError(requirementId, err);
  }
}

function logVerifyError(requirementId: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[chonky/verify] ${requirementId}: ${message}`);

  if (typeof window !== 'undefined') {
    if (!window.__CHONKY_LOGS__) {
      window.__CHONKY_LOGS__ = [];
    }
    window.__CHONKY_LOGS__.push({
      requirementId,
      error: message,
      timestamp: Date.now(),
    });
  }
}

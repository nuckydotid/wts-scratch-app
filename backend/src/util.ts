/** `unref()` exists on Bun/Node timers only; this keeps the code typecheckable in DOM/React Native contexts (the app imports the API types). */
export const unref = (t: unknown): void => {
  (t as { unref?: () => void } | undefined)?.unref?.();
};

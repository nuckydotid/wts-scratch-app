/**
 * Canvas deep-link focus: the GUI "Open" action navigates to
 * `/?node=<screen-id>`; the id must exist in the current canvas before we
 * select and center it, otherwise the canvas stays untouched.
 */
export function resolveFocusNodeId(
  param: string | string[] | undefined,
  nodeIds: Iterable<string>,
): string | null {
  const requested = Array.isArray(param) ? param[0] : param;
  if (!requested) return null;
  for (const id of nodeIds) {
    if (id === requested) return requested;
  }
  return null;
}

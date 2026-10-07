import type { NavigationEdgeData } from "../data/screens-tree-data";

/**
 * One straight root→target flow through the navigation graph.
 * `nodeIds`/`edgeIds` are in forward traversal order.
 */
export interface EntryPath {
  nodeIds: string[];
  edgeIds: string[];
  /** Incoming edge into the target (the last hop of the path). */
  lastEdge?: NavigationEdgeData;
}

export interface GetEntryPathsOptions {
  /** Include auxiliary (return/dismissal) edges. Defaults to false. */
  includeAuxiliary?: boolean;
  /** Hard cap on returned paths. Defaults to 50. */
  maxPaths?: number;
}

export interface EntryPathsResult {
  paths: EntryPath[];
  /** True when more paths existed but were cut off by `maxPaths`. */
  truncated: boolean;
}

/**
 * Enumerates every simple entry path into `targetId`: walk incoming
 * navigation edges backwards until a node with no incoming edge (an entry
 * root such as `root-index`), collecting one path per route. Results are
 * shortest-first and lexicographically stable so the inspector does not
 * reshuffle between renders. Cycles are guarded per-path; a target with no
 * incoming edges is its own entry path.
 */
export function getEntryPaths(
  targetId: string,
  navEdges: NavigationEdgeData[],
  options: GetEntryPathsOptions = {},
): EntryPathsResult {
  const { includeAuxiliary = false, maxPaths = 50 } = options;
  const edges = includeAuxiliary
    ? navEdges
    : navEdges.filter((edge) => !edge.isAuxiliary);

  const incoming = new Map<string, NavigationEdgeData[]>();
  for (const edge of edges) {
    const list = incoming.get(edge.target) ?? [];
    list.push(edge);
    incoming.set(edge.target, list);
  }
  for (const list of incoming.values()) {
    list.sort(
      (a, b) => a.source.localeCompare(b.source) || a.id.localeCompare(b.id),
    );
  }

  const paths: EntryPath[] = [];
  let truncated = false;
  let budget = 0;

  const walk = (
    nodeId: string,
    targetFirstNodes: string[],
    targetFirstEdges: NavigationEdgeData[],
    visited: Set<string>,
  ): void => {
    const incomingEdges = incoming.get(nodeId) ?? [];
    if (incomingEdges.length === 0) {
      if (budget >= maxPaths) {
        truncated = true;
        return;
      }
      budget += 1;
      paths.push({
        nodeIds: [...targetFirstNodes].reverse(),
        edgeIds: targetFirstEdges.map((edge) => edge.id),
        lastEdge: targetFirstEdges.at(-1),
      });
      return;
    }
    for (const edge of incomingEdges) {
      if (visited.has(edge.source)) continue;
      visited.add(edge.source);
      walk(
        edge.source,
        [...targetFirstNodes, edge.source],
        [edge, ...targetFirstEdges],
        visited,
      );
      visited.delete(edge.source);
    }
  };

  walk(targetId, [targetId], [], new Set([targetId]));

  paths.sort(
    (a, b) =>
      a.nodeIds.length - b.nodeIds.length ||
      a.nodeIds.join(">").localeCompare(b.nodeIds.join(">")),
  );

  return { paths, truncated };
}

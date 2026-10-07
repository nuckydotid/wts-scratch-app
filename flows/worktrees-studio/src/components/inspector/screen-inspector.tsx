import React, { useState, useCallback, useMemo } from "react";
import type {
  ScreenNodeData,
  NavigationEdgeData,
} from "../../data/screens-tree-data";
import { getEntryPaths, type EntryPath } from "../../utils/entrypoints";

interface ScreenInspectorProps {
  screen: ScreenNodeData | null;
  onClose: () => void;
  onSelectScreen?: (id: string) => void;
  allScreens: ScreenNodeData[];
  navigationEdges?: NavigationEdgeData[];
  /** Enables the Entrypoints section (navigation mode only). */
  onShowPath?: (path: EntryPath) => void;
  /** True while the canvas is narrowed to a single straight flow. */
  isIsolated?: boolean;
  onClearIsolation?: () => void;
}

/** `a → b → … → y → z` with the middle collapsed past four nodes. */
function formatPathBreadcrumb(
  nodeIds: string[],
  screenMap: Map<string, ScreenNodeData>,
): string {
  const titles = nodeIds.map((id) => screenMap.get(id)?.title ?? id);
  if (titles.length <= 4) return titles.join(" → ");
  return [
    ...titles.slice(0, 2),
    `… ${titles.length - 4} more …`,
    ...titles.slice(-2),
  ].join(" → ");
}

function getTestIdBadge(
  isAnchor: boolean,
  isDynamic: boolean,
): { label: string; className: string } {
  if (isAnchor) {
    return {
      label: "Anchor",
      className: "bg-emerald-500/20 text-emerald-400",
    };
  }
  if (isDynamic) {
    return {
      label: "Dynamic",
      className: "bg-amber-500/20 text-amber-400",
    };
  }
  return {
    label: "Element",
    className: "bg-content3/70 text-muted",
  };
}

interface TransitionCardProps {
  screenNode?: ScreenNodeData;
  screenId: string;
  type: string;
  trigger?: string;
  testID?: string;
  label?: string;
  onClick: (id: string) => void;
  direction: "in" | "out";
}

function TransitionCard({
  screenNode,
  screenId,
  type,
  trigger,
  testID,
  label,
  onClick,
  direction,
}: Readonly<TransitionCardProps>) {
  return (
    <button
      type="button"
      onClick={() => onClick(screenId)}
      data-testid={`transition-${direction}-${screenId}`}
      className="w-full text-left p-2 rounded-lg border border-border/70 bg-content2/40 hover:bg-content2 hover:border-primary/50 transition-all flex items-center justify-between group cursor-pointer"
    >
      <div className="truncate mr-2 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-mono font-bold uppercase px-1 rounded bg-content3/60 text-muted border border-border/40">
            {type}
          </span>
          <span className="font-medium text-foreground text-[11px] group-hover:text-primary transition-colors truncate">
            {screenNode?.title || screenId}
          </span>
        </div>

        {(testID || trigger || label) && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted">
            {testID && (
              <span className="text-emerald-500 font-semibold truncate">
                🎯 {testID}
              </span>
            )}
            {!testID && trigger && (
              <span className="text-primary truncate">{trigger}</span>
            )}
            {label && !testID && !trigger && (
              <span className="truncate">{label}</span>
            )}
          </div>
        )}
      </div>

      <span className="text-muted group-hover:text-primary transition-colors text-xs flex-shrink-0">
        {direction === "in" ? "↖" : "↗"}
      </span>
    </button>
  );
}

export function ScreenInspector({
  screen,
  onClose,
  onSelectScreen,
  allScreens,
  navigationEdges,
  onShowPath,
  isIsolated,
  onClearIsolation,
}: Readonly<ScreenInspectorProps>) {
  const [testIdFilter, setTestIdFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // React 19 compliant: Adjust state during render when screen changes instead of cascading effects
  const [prevScreenId, setPrevScreenId] = useState<string | undefined>(
    screen?.id,
  );
  if (screen?.id !== prevScreenId) {
    setPrevScreenId(screen?.id);
    setTestIdFilter("");
    setCopiedId(null);
    setCopiedAll(false);
  }

  const testIDs = useMemo(() => {
    if (!screen) return [];
    if (screen.testIDs && screen.testIDs.length > 0) {
      return screen.testIDs;
    }
    return [screen.testID];
  }, [screen]);

  const filteredTestIDs = useMemo(() => {
    const query = testIdFilter.trim().toLowerCase();
    if (!query) return testIDs;
    return testIDs.filter((id) => id.toLowerCase().includes(query));
  }, [testIDs, testIdFilter]);

  const incomingTransitions = useMemo(() => {
    if (!screen || !navigationEdges) return [];
    return navigationEdges.filter((e) => e.target === screen.id);
  }, [screen, navigationEdges]);

  const outgoingTransitions = useMemo(() => {
    if (!screen || !navigationEdges) return [];
    return navigationEdges.filter((e) => e.source === screen.id);
  }, [screen, navigationEdges]);

  const screenMap = useMemo(
    () => new Map(allScreens.map((s) => [s.id, s])),
    [allScreens],
  );

  const entryPathsResult = useMemo(() => {
    if (!screen || !navigationEdges || !onShowPath) {
      return { paths: [], truncated: false };
    }
    return getEntryPaths(screen.id, navigationEdges);
  }, [screen, navigationEdges, onShowPath]);

  const handleCopyId = useCallback((id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id).catch((e) => {
        if (
          typeof process !== "undefined" &&
          process.env?.NODE_ENV === "development"
        )
          console.warn("[inspector] copy failed:", e);
      });
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 1500);
  }, []);

  const handleCopyAll = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(testIDs.join("\n")).catch((e) => {
        if (
          typeof process !== "undefined" &&
          process.env?.NODE_ENV === "development"
        )
          console.warn("[inspector] copy failed:", e);
      });
    }
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 1500);
  }, [testIDs]);

  if (!screen) return null;

  const parentScreen = screen.parentId
    ? allScreens.find((s) => s.id === screen.parentId)
    : null;

  const childScreens = allScreens.filter((s) => s.parentId === screen.id);

  return (
    <aside
      aria-label="Screen Details Inspector"
      className="absolute top-16 right-4 bottom-4 w-96 rounded-2xl border border-border bg-content1/95 backdrop-blur-md shadow-2xl p-5 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-primary/10 text-primary mb-1.5">
            {screen.category} · {screen.type}
            {typeof screen.teleportKind === "string"
              ? ` · ${screen.teleportKind}`
              : ""}
          </span>
          <h2 className="text-base font-bold text-foreground leading-snug">
            {screen.title}
          </h2>
          {screen.componentName && (
            <div className="text-xs font-mono text-primary font-semibold mt-0.5">
              &lt;{screen.componentName} /&gt;
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          type="button"
          aria-label="Close Inspector"
          data-testid="flow-inspector-close"
          className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-content2 transition-colors cursor-pointer"
        >
          <span className="text-base leading-none">✕</span>
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
        {/* Scanned Maestro TestIDs List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                🎯 Maestro testIDs
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {testIDs.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              data-testid="flow-inspector-copy-all-testid"
              className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/80 bg-content2/60 hover:bg-content2 text-muted hover:text-foreground transition-all cursor-pointer flex items-center gap-1"
              title="Copy all testIDs to clipboard"
            >
              {copiedAll ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span className="text-emerald-400 font-bold">Copied All</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>

          {/* Filter Input if >= 4 testIDs */}
          {testIDs.length >= 4 && (
            <div className="relative">
              <input
                type="text"
                value={testIdFilter}
                onChange={(e) => setTestIdFilter(e.target.value)}
                placeholder="Filter testIDs..."
                data-testid="flow-inspector-filter-testids"
                className="w-full bg-content2/70 border border-border/70 rounded-lg px-2.5 py-1 text-[11px] font-mono text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/60 transition-colors"
              />
              {testIdFilter && (
                <button
                  type="button"
                  onClick={() => setTestIdFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-[11px] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* TestID Items List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {filteredTestIDs.map((id) => {
              const isAnchor = id === screen.testID;
              const isDynamic = id.includes("${");
              const isCopied = copiedId === id;
              const badge = getTestIdBadge(isAnchor, isDynamic);

              return (
                <div
                  key={id}
                  data-testid={`flow-inspector-testid-${id}`}
                  className={`group font-mono text-[11px] rounded-lg px-2.5 py-1.5 border flex items-center justify-between gap-2 transition-all select-all ${
                    isAnchor
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-content2/50 text-foreground border-border/50 hover:bg-content2"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className={`text-[9px] uppercase px-1 py-0.5 rounded font-sans font-semibold flex-shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="truncate font-semibold">{id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyId(id)}
                    aria-label={`Copy testID ${id}`}
                    data-testid={`flow-inspector-copy-${id}`}
                    className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded hover:bg-content3 text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Copy testID"
                  >
                    {isCopied ? (
                      <span className="text-emerald-400 font-bold">✓</span>
                    ) : (
                      <span className="opacity-60 group-hover:opacity-100">
                        📋
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            {filteredTestIDs.length === 0 && (
              <div className="text-[11px] text-muted text-center py-2 bg-content2/30 rounded-lg border border-border/30">
                No testIDs matching &quot;{testIdFilter}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Route Path */}
        <div>
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
            Expo Router Path
          </span>
          <div className="font-mono bg-content2 px-3 py-2 rounded-lg text-foreground text-[11px] break-all border border-border/60 select-all">
            {screen.route}
          </div>
        </div>

        {/* Source File */}
        <div>
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
            Route File
          </span>
          <div className="font-mono bg-content2/60 px-3 py-2 rounded-lg text-muted text-[11px] break-all border border-border/40 select-all">
            {screen.type === "teleport"
              ? screen.filePath
              : `apps/app/${screen.filePath}`}
          </div>
        </div>

        {/* Target Module (if re-exported) */}
        {screen.targetModule && (
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
              Screen Module
            </span>
            <div className="font-mono bg-content2/60 px-3 py-2 rounded-lg text-muted text-[11px] break-all border border-border/40 select-all">
              apps/app/
              {screen.targetModule.replace(/^@\//, "src/")}.tsx
            </div>
          </div>
        )}

        {/* Code Description */}
        <div>
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
            Architecture Spec
          </span>
          <p className="text-foreground/90 font-mono text-[11px] leading-relaxed bg-content2/30 p-3 rounded-lg border border-border/40">
            {screen.description}
          </p>
        </div>

        {/* Dynamic Route Parameters */}
        {screen.params && screen.params.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              URL Route Parameters
            </span>
            <div className="flex flex-wrap gap-1.5">
              {screen.params.map((param) => (
                <span
                  key={param}
                  className="px-2 py-1 rounded bg-warning/15 text-warning font-mono font-bold text-[11px]"
                >
                  :{param}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Flow: Incoming Transitions */}
        {incomingTransitions.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                ↙ Incoming Routes ({incomingTransitions.length})
              </span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {incomingTransitions.map((edge) => (
                <TransitionCard
                  key={edge.id}
                  screenNode={screenMap.get(edge.source)}
                  screenId={edge.source}
                  type={edge.transitionType}
                  trigger={edge.trigger}
                  testID={edge.testID}
                  label={edge.label}
                  onClick={(id) => onSelectScreen?.(id)}
                  direction="in"
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation Flow: Outgoing Transitions */}
        {outgoingTransitions.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                ↗ Outgoing Routes ({outgoingTransitions.length})
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {outgoingTransitions.map((edge) => (
                <TransitionCard
                  key={edge.id}
                  screenNode={screenMap.get(edge.target)}
                  screenId={edge.target}
                  type={edge.transitionType}
                  trigger={edge.trigger}
                  testID={edge.testID}
                  label={edge.label}
                  onClick={(id) => onSelectScreen?.(id)}
                  direction="out"
                />
              ))}
            </div>
          </div>
        )}

        {/* Entry Paths: every straight root→screen flow */}
        {onShowPath && navigationEdges && entryPathsResult.paths.length > 0 && (
          <div data-testid="flow-inspector-entrypoints">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-warning uppercase tracking-wider">
                  ⤓ Entrypoints
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-warning/15 text-warning border border-warning/30">
                  {entryPathsResult.paths.length}
                </span>
                {entryPathsResult.truncated && (
                  <span className="text-[10px] font-mono text-muted">
                    + more
                  </span>
                )}
              </div>
              {isIsolated && (
                <button
                  type="button"
                  onClick={() => onClearIsolation?.()}
                  data-testid="flow-inspector-show-full-graph"
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/80 bg-content2/60 hover:bg-content2 text-muted hover:text-foreground transition-all cursor-pointer"
                >
                  Show full graph
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {entryPathsResult.paths.map((path, index) => {
                const lastEdge = path.lastEdge;
                return (
                  <button
                    key={`${path.edgeIds.join(">")}-${index}`}
                    type="button"
                    onClick={() => onShowPath(path)}
                    data-testid={`flow-inspector-entrypoint-${index}`}
                    className="w-full text-left p-2 rounded-lg border border-border/60 bg-content2/30 hover:bg-content2 hover:border-warning/50 transition-all group cursor-pointer"
                    title={path.nodeIds.join(" → ")}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-mono font-bold uppercase px-1 rounded bg-warning/15 text-warning border border-warning/30">
                        {lastEdge?.transitionType ?? "start"}
                      </span>
                      <span className="font-medium text-foreground text-[11px] group-hover:text-warning transition-colors truncate">
                        {formatPathBreadcrumb(path.nodeIds, screenMap)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                      <span>{path.nodeIds.length} screens</span>
                      {lastEdge?.testID && (
                        <span className="text-emerald-500 font-semibold truncate">
                          🎯 {lastEdge.testID}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upstream Parent Route */}
        {parentScreen && (
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Parent Screen / Layout
            </span>
            <button
              onClick={() => onSelectScreen?.(parentScreen.id)}
              className="w-full text-left p-2.5 rounded-lg border border-border/80 bg-content2/40 hover:bg-content2 hover:border-primary/50 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {parentScreen.title}
                </div>
                <div className="font-mono text-[10px] text-muted">
                  {parentScreen.route}
                </div>
              </div>
              <span className="text-muted group-hover:text-primary transition-colors text-sm">
                ↗
              </span>
            </button>
          </div>
        )}

        {/* Downstream Child Routes */}
        {childScreens.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Sub-routes & Children ({childScreens.length})
            </span>
            <div className="space-y-1.5">
              {childScreens.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onSelectScreen?.(child.id)}
                  className="w-full text-left p-2 rounded-lg border border-border/60 bg-content2/30 hover:bg-content2 hover:border-primary/50 transition-all flex items-center justify-between group"
                >
                  <div className="truncate mr-2">
                    <div className="font-medium text-foreground text-[11px] group-hover:text-primary transition-colors truncate">
                      {child.title}
                    </div>
                    <div className="font-mono text-[9px] text-muted truncate">
                      {child.route}
                    </div>
                  </div>
                  <span className="text-muted group-hover:text-primary transition-colors text-xs flex-shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
        <span>ID: {screen.id}</span>
        <span className="capitalize">{screen.type} Archetype</span>
      </div>
    </aside>
  );
}

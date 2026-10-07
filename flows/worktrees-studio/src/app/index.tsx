import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocalSearchParams } from "expo-router";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  SCREEN_NODES,
  SCREEN_EDGES,
  NAVIGATION_EDGES,
  type ScreenCategory,
  type ScreenNodeData,
  type NavigationEdgeData,
} from "../data/screens-tree-data";
import {
  ScreenNode,
  type ExtendedScreenNodeData,
} from "../components/nodes/screen-node";
import { NavigationEdge } from "../components/edges/navigation-edge";
import { resolveFocusNodeId } from "../utils/focus-node";
import { ScreenInspector } from "../components/inspector/screen-inspector";
import { FlowHeaderToolbar } from "../components/toolbar/flow-header-toolbar";
import { FlowSidebar } from "../components/sidebar/flow-sidebar";
import { getLayoutedElements } from "../utils/layout-tree";
import type { EntryPath } from "../utils/entrypoints";
import { useDebouncedValue } from "@repo/worktrees-studio-ds";
import { categoryHandleColor, MUTED_CANVAS_COLOR } from "../utils/flow-colors";

const NODE_TYPES = {
  screenNode: ScreenNode,
};

const EDGE_TYPES = {
  navigationEdge: NavigationEdge,
};

const SCREEN_NODE_BY_ID = new Map(SCREEN_NODES.map((n) => [n.id, n]));

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: MUTED_CANVAS_COLOR,
  },
  style: {
    strokeWidth: 1.5,
    stroke: MUTED_CANVAS_COLOR,
  },
};

function FlowCanvasInner() {
  const [viewMode, setViewMode] = useState<"layout" | "navigation">("layout");
  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);
  const [layoutDirection, setLayoutDirection] = useState<"TB" | "LR">("TB");
  const [showAuxiliary, setShowAuxiliary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ScreenCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { node: focusParam } = useLocalSearchParams<{ node?: string }>();
  const focusAppliedRef = useRef(false);
  const [isolatedPath, setIsolatedPath] = useState<EntryPath | null>(null);

  // Debounce canvas filtering so Dagre relayout + fitView do not run per keystroke.
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 150);

  const { fitView } = useReactFlow();

  // Counts by category
  const counts = useMemo(() => {
    const res: Record<ScreenCategory | "all", number> = {
      all: SCREEN_NODES.length,
      root: 0,
      public: 0,
      admin: 0,
      member: 0,
      staff: 0,
      e2e: 0,
    };
    SCREEN_NODES.forEach((n) => {
      res[n.category] = (res[n.category] || 0) + 1;
    });
    return res;
  }, []);

  // Filtered raw elements based on active mode and category
  const { filteredRawNodes, filteredRawEdges } = useMemo(() => {
    // A selected straight flow narrows the navigation canvas to its exact
    // chain nodes + edges; the sync effect below refits automatically.
    if (viewMode === "navigation" && isolatedPath) {
      const chainNodeIds = new Set(isolatedPath.nodeIds);
      const chainEdgeIds = new Set(isolatedPath.edgeIds);
      return {
        filteredRawNodes: SCREEN_NODES.filter((n) => chainNodeIds.has(n.id)),
        filteredRawEdges: NAVIGATION_EDGES.filter((e) =>
          chainEdgeIds.has(e.id),
        ),
      };
    }

    if (viewMode === "layout") {
      if (activeCategory === "all") {
        return {
          filteredRawNodes: SCREEN_NODES,
          filteredRawEdges: SCREEN_EDGES,
        };
      }

      // Include category nodes plus root layout/index for continuity
      const matchedNodeIds = new Set<string>();
      SCREEN_NODES.forEach((node) => {
        if (node.category === activeCategory) {
          matchedNodeIds.add(node.id);
          // Include upstream ancestors
          let currentParent = node.parentId;
          while (currentParent) {
            matchedNodeIds.add(currentParent);
            const p = SCREEN_NODE_BY_ID.get(currentParent);
            currentParent = p?.parentId;
          }
        }
      });

      // In layout mode, also include teleport entities associated with category layouts or screens
      SCREEN_NODES.forEach((node) => {
        if (
          node.type === "teleport" &&
          node.parentId &&
          matchedNodeIds.has(node.parentId)
        ) {
          matchedNodeIds.add(node.id);
        }
      });
      NAVIGATION_EDGES.forEach((e) => {
        if (matchedNodeIds.has(e.source)) {
          const targetNode = SCREEN_NODE_BY_ID.get(e.target);
          if (targetNode?.type === "teleport") {
            matchedNodeIds.add(e.target);
          }
        }
      });

      const categoryNodes = SCREEN_NODES.filter((n) =>
        matchedNodeIds.has(n.id),
      );
      const categoryEdges = SCREEN_EDGES.filter(
        (e) => matchedNodeIds.has(e.source) && matchedNodeIds.has(e.target),
      );

      return {
        filteredRawNodes: categoryNodes,
        filteredRawEdges: categoryEdges,
      };
    }

    // --- Navigation Flow Mode ---
    const baseNavEdges = showAuxiliary
      ? NAVIGATION_EDGES
      : NAVIGATION_EDGES.filter((e) => !e.isAuxiliary);

    if (activeCategory === "all") {
      const nonLayoutNodes = SCREEN_NODES.filter((n) => n.type !== "layout");
      const connectedNodeIds = new Set<string>();
      baseNavEdges.forEach((e) => {
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      });
      const navNodes = nonLayoutNodes.filter((n) => connectedNodeIds.has(n.id));

      return {
        filteredRawNodes: navNodes,
        filteredRawEdges: baseNavEdges,
      };
    }

    // Specific category in Navigation mode: include auth spine + category screens
    const matchedNodeIds = new Set<string>([
      "root-index",
      "public-login-email",
      "public-login-otp",
    ]);

    if (activeCategory === "member") {
      matchedNodeIds.add("app-parent-onboarding");
    }

    SCREEN_NODES.forEach((node) => {
      if (node.category === activeCategory && node.type !== "layout") {
        matchedNodeIds.add(node.id);
      }
    });

    // Automatically include teleport entities directly connected to/from category screens
    baseNavEdges.forEach((e) => {
      if (matchedNodeIds.has(e.source)) {
        const targetNode = SCREEN_NODE_BY_ID.get(e.target);
        if (targetNode?.type === "teleport") {
          matchedNodeIds.add(e.target);
        }
      }
      if (matchedNodeIds.has(e.target)) {
        const sourceNode = SCREEN_NODE_BY_ID.get(e.source);
        if (sourceNode?.type === "teleport") {
          matchedNodeIds.add(e.source);
        }
      }
    });

    // Also include downstream transitions from those teleport entities (e.g. teleport-menu -> public-login-email)
    baseNavEdges.forEach((e) => {
      if (matchedNodeIds.has(e.source)) {
        const targetNode = SCREEN_NODE_BY_ID.get(e.target);
        if (targetNode?.type === "teleport") {
          matchedNodeIds.add(e.target);
        }
      }
    });

    const categoryNavEdges = baseNavEdges.filter(
      (e) => matchedNodeIds.has(e.source) && matchedNodeIds.has(e.target),
    );

    const connectedNodeIds = new Set<string>();
    categoryNavEdges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const categoryNavNodes = SCREEN_NODES.filter((n) =>
      connectedNodeIds.has(n.id),
    );

    return {
      filteredRawNodes: categoryNavNodes,
      filteredRawEdges: categoryNavEdges,
    };
  }, [viewMode, activeCategory, showAuxiliary, isolatedPath]);

  // Compute Dagre layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes: Node<ExtendedScreenNodeData>[] = filteredRawNodes.map(
      (node) => ({
        id: node.id,
        type: "screenNode",
        data: {
          ...node,
          isDimmed: false,
          isMatched: false,
        },
        position: { x: 0, y: 0 },
      }),
    );

    const isNav = viewMode === "navigation";
    const dir = isNav ? layoutDirection : "TB";

    const rawEdges: Edge[] = filteredRawEdges.map((e) => {
      if (isNav) {
        const navData = e as NavigationEdgeData;
        return {
          id: navData.id,
          source: navData.source,
          target: navData.target,
          type: "navigationEdge",
          data: navData,
        };
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        style: {
          strokeWidth: 1.5,
          stroke: MUTED_CANVAS_COLOR,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: MUTED_CANVAS_COLOR,
        },
      };
    });

    const isLR = dir === "LR";
    let ranksep = 220;
    let nodesep = 140;

    if (isNav) {
      ranksep = isLR ? 540 : 440;
      nodesep = isLR ? 260 : 340;
    } else if (isLR) {
      ranksep = 320;
      nodesep = 120;
    }

    const layouted = getLayoutedElements(rawNodes, rawEdges, {
      direction: dir,
      ranksep,
      nodesep,
      edgesep: 120,
      marginx: 160,
      marginy: 160,
    });

    return {
      initialNodes: layouted.nodes,
      initialEdges: layouted.edges,
    };
  }, [filteredRawNodes, filteredRawEdges, viewMode, layoutDirection]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<ExtendedScreenNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync layouted nodes when category changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    const timeout = setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  // GUI deep link: `/?node=<screen-id>` selects and centers the node once the
  // first layout is ready. Unknown ids leave the canvas untouched.
  useEffect(() => {
    if (focusAppliedRef.current) return;
    const focusId = resolveFocusNodeId(
      focusParam,
      SCREEN_NODES.map((n) => n.id),
    );
    if (!focusId) return;
    focusAppliedRef.current = true;
    const timeout = setTimeout(() => {
      setSelectedNodeId(focusId);
      fitView({ nodes: [{ id: focusId }], padding: 0.35, duration: 600 });
    }, 80);
    return () => clearTimeout(timeout);
  }, [focusParam, fitView]);

  // Scope changes leave the isolated flow behind; picking a path never
  // touches category/search, so these wrappers only fire on scope edits.
  const handleViewModeChange = useCallback((mode: "layout" | "navigation") => {
    setIsolatedPath(null);
    setViewMode(mode);
  }, []);

  const handleCategoryChange = useCallback(
    (category: ScreenCategory | "all") => {
      setIsolatedPath(null);
      setActiveCategory(category);
    },
    [],
  );

  const handleSearchChange = useCallback((query: string) => {
    setIsolatedPath(null);
    setSearchQuery(query);
  }, []);

  const handleToggleAuxiliary = useCallback(() => {
    setIsolatedPath(null);
    setShowAuxiliary((prev) => !prev);
  }, []);

  // Apply search filtering
  useEffect(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();

    setNodes((nds) =>
      nds.map((node) => {
        if (!query) {
          return {
            ...node,
            data: {
              ...node.data,
              isDimmed: false,
              isMatched: false,
            },
          };
        }

        const nodeData = node.data as ExtendedScreenNodeData;
        const matches =
          Boolean(nodeData.title?.toLowerCase().includes(query)) ||
          Boolean(nodeData.route?.toLowerCase().includes(query)) ||
          Boolean(nodeData.description?.toLowerCase().includes(query)) ||
          Boolean(
            nodeData.params?.some((p: string) =>
              p.toLowerCase().includes(query),
            ),
          ) ||
          Boolean(nodeData.testID?.toLowerCase().includes(query)) ||
          Boolean(
            nodeData.testIDs?.some((tid: string) =>
              tid.toLowerCase().includes(query),
            ),
          );

        return {
          ...node,
          data: {
            ...nodeData,
            isDimmed: !matches,
            isMatched: Boolean(matches),
          },
        };
      }),
    );
  }, [debouncedSearchQuery, initialNodes, setNodes]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 500 });
  }, [fitView]);

  const selectedScreen = useMemo(() => {
    if (!selectedNodeId) return null;
    return SCREEN_NODE_BY_ID.get(selectedNodeId) ?? null;
  }, [selectedNodeId]);

  const handleSelectScreen = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      const targetNode = nodes.find((n) => n.id === id);
      if (targetNode) {
        fitView({
          nodes: [targetNode],
          duration: 600,
          maxZoom: 1.2,
        });
      }
    },
    [nodes, fitView],
  );

  const handleShowPath = useCallback((path: EntryPath) => {
    setIsolatedPath(path);
  }, []);

  const handleClearIsolation = useCallback(() => {
    setIsolatedPath(null);
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
      {/* Top Header Controls Bar */}
      <FlowHeaderToolbar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFitView={handleFitView}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={setLayoutDirection}
        showAuxiliary={showAuxiliary}
        onToggleAuxiliary={handleToggleAuxiliary}
        edgeCount={filteredRawEdges.length}
      />

      {/* Main Workspace Layout: Sidebar + Canvas */}
      <div className="flex flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Left Route Scopes Sidebar */}
        <FlowSidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          counts={counts}
        />

        {/* Main Flow Canvas Container */}
        <main
          aria-label="Visual Screen Hierarchy Canvas"
          className="flex-1 w-full h-full relative overflow-hidden"
        >
          {/* Isolated straight-flow banner */}
          {isolatedPath && (
            <div
              data-testid="flow-isolation-banner"
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-warning/40 bg-content1/95 backdrop-blur-md px-3 py-1.5 shadow-lg"
            >
              <span className="text-[11px] font-mono font-semibold text-warning">
                ▼ 1 straight flow ({isolatedPath.nodeIds.length} screens)
              </span>
              <button
                type="button"
                onClick={handleClearIsolation}
                data-testid="flow-isolation-clear"
                className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-border/80 bg-content2/70 hover:bg-content2 text-muted hover:text-foreground transition-all cursor-pointer"
              >
                Show full graph
              </button>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.05}
            maxZoom={1.8}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              zoomable
              pannable
              nodeStrokeWidth={2}
              nodeColor={(n) =>
                categoryHandleColor(
                  (n.data as unknown as ScreenNodeData | undefined)?.category,
                )
              }
              className="!rounded-xl !border !border-border !bg-content1/80 !backdrop-blur-sm shadow-md overflow-hidden"
            />
          </ReactFlow>

          {/* Selected Screen Inspector Drawer */}
          <ScreenInspector
            screen={selectedScreen}
            onClose={() => setSelectedNodeId(null)}
            onSelectScreen={handleSelectScreen}
            allScreens={SCREEN_NODES}
            navigationEdges={NAVIGATION_EDGES}
            onShowPath={viewMode === "navigation" ? handleShowPath : undefined}
            isIsolated={Boolean(isolatedPath)}
            onClearIsolation={handleClearIsolation}
          />
        </main>
      </div>
    </div>
  );
}

export default function BlankFlowScreen() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

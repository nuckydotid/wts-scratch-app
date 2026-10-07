import { testIds } from "@repo/worktrees-studio-shared-ids";
import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type {
  ScreenNodeData,
  ScreenCategory,
  ScreenArchetype,
} from "../../data/screens-tree-data";
import { categoryHandleColor } from "../../utils/flow-colors";

export type ExtendedScreenNodeData = ScreenNodeData & {
  isDimmed?: boolean;
  isMatched?: boolean;
};

const CATEGORY_STYLES: Record<
  ScreenCategory,
  {
    border: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  }
> = {
  root: {
    border: "border-slate-400 dark:border-slate-600",
    badgeBg: "bg-slate-100 dark:bg-slate-800/80",
    badgeText: "text-slate-800 dark:text-slate-200",
    glow: "shadow-slate-500/20",
  },
  public: {
    border: "border-amber-400 dark:border-amber-600",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60",
    badgeText: "text-amber-800 dark:text-amber-300",
    glow: "shadow-amber-500/20",
  },
  admin: {
    border: "border-purple-400 dark:border-purple-600",
    badgeBg: "bg-purple-100 dark:bg-purple-950/60",
    badgeText: "text-purple-800 dark:text-purple-300",
    glow: "shadow-purple-500/20",
  },
  member: {
    border: "border-emerald-400 dark:border-emerald-600",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    glow: "shadow-emerald-500/20",
  },
  staff: {
    border: "border-sky-400 dark:border-sky-600",
    badgeBg: "bg-sky-100 dark:bg-sky-950/60",
    badgeText: "text-sky-800 dark:text-sky-300",
    glow: "shadow-sky-500/20",
  },
  e2e: {
    border: "border-zinc-400/60 dark:border-zinc-600/60 border-dashed",
    badgeBg: "bg-zinc-100 dark:bg-zinc-800/60",
    badgeText: "text-zinc-700 dark:text-zinc-300",
    glow: "shadow-zinc-500/10",
  },
};

const ARCHETYPE_ICONS: Record<ScreenArchetype, string> = {
  layout: "📁",
  tab: "📑",
  screen: "📄",
  dynamic: "⚡",
  teleport: "🔮",
};

export const ScreenNode = memo(function ScreenNodeComponent({
  data,
  selected,
  targetPosition,
  sourcePosition,
}: NodeProps<Node<ExtendedScreenNodeData>>) {
  const categoryStyle = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.root;

  const isDimmed = data.isDimmed ?? false;
  const isMatched = data.isMatched ?? false;
  const isTeleport = data.type === "teleport";

  const targetPos = targetPosition || Position.Top;
  const sourcePos = sourcePosition || Position.Bottom;

  let stateClasses = "border-border/60 hover:border-border";
  if (selected) {
    stateClasses = `ring-2 ring-primary ring-offset-2 ring-offset-background ${categoryStyle.border}`;
  } else if (isMatched) {
    stateClasses = "ring-2 ring-warning/80 border-warning";
  } else if (isTeleport) {
    stateClasses =
      "border-violet-500/70 shadow-violet-500/15 shadow-sm hover:border-violet-400 dark:border-violet-400/80";
  }

  return (
    <div
      style={{ width: 280 }}
      data-testid={testIds.flow.node(data.id)}
      className={`relative group rounded-xl border bg-content1 px-3.5 py-3 shadow-sm transition-all duration-200 select-none ${
        categoryStyle.border
      } ${stateClasses} ${isDimmed ? "opacity-30 blur-[0.3px]" : "opacity-100"}`}
    >
      <Handle
        type="target"
        position={targetPos}
        style={{
          backgroundColor: categoryHandleColor(data.category),
          width: 8,
          height: 8,
          border: "2px solid var(--color-background, #ffffff)",
        }}
      />

      {/* Header Row: Badge & Type */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${categoryStyle.badgeBg} ${categoryStyle.badgeText}`}
        >
          {data.badge || data.category.toUpperCase()}
        </span>

        <div className="flex items-center gap-1">
          {data.testIDs && data.testIDs.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              title={`${data.testIDs.length} testIDs scanned`}
            >
              🎯 {data.testIDs.length}
            </span>
          )}

          <span className="flex items-center gap-0.5 text-[10px] text-muted font-medium bg-content2 px-1.5 py-0.5 rounded">
            <span>{ARCHETYPE_ICONS[data.type]}</span>
            <span className="capitalize">{data.type}</span>
          </span>
        </div>
      </div>

      {/* Screen Title */}
      <div
        className="text-xs font-bold text-foreground truncate mb-0.5"
        title={data.title}
      >
        {data.title}
      </div>

      {/* Monospace Route Path */}
      <div
        className="text-[10px] font-mono text-muted truncate bg-content2/50 px-1.5 py-0.5 rounded border border-border/50"
        title={data.route}
      >
        {data.route}
      </div>

      {/* Parameter Chips */}
      {data.params && data.params.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {data.params.map((param) => (
            <span
              key={param}
              className="text-[9px] font-mono bg-warning/15 text-warning font-semibold px-1 rounded"
            >
              :{param}
            </span>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={sourcePos}
        style={{
          backgroundColor: categoryHandleColor(data.category),
          width: 8,
          height: 8,
          border: "2px solid var(--color-background, #ffffff)",
        }}
      />
    </div>
  );
});

import { testIds } from "@repo/worktrees-studio-shared-ids";
import React from "react";
import type { ScreenCategory } from "../../data/screens-tree-data";

export interface FlowSidebarProps {
  activeCategory: ScreenCategory | "all";
  onCategoryChange: (category: ScreenCategory | "all") => void;
  counts: Record<ScreenCategory | "all", number>;
}

const CATEGORY_ITEMS: {
  id: ScreenCategory | "all";
  label: string;
  scope: string;
  color: string;
}[] = [
  {
    id: "all",
    label: "All Routes",
    scope: "src/app/**",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "admin",
    label: "(app)/admin",
    scope: "/(app)/admin/*",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "staff",
    label: "(app)/staff",
    scope: "/(app)/staff/*",
    color: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  },
  {
    id: "member",
    label: "(app)/member",
    scope: "/(app)/member/*",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    id: "public",
    label: "public",
    scope: "/public/*",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "root",
    label: "root",
    scope: "/* & _layout",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  {
    id: "e2e",
    label: "e2e",
    scope: "/e2e-*",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
];

const ARCHETYPES = [
  { label: "layout", desc: "_layout.tsx stack" },
  { label: "tab", desc: "bottom tab root" },
  { label: "screen", desc: "stack screen" },
  { label: "dynamic", desc: "[param] route" },
  { label: "teleport", desc: "portal / overlay entity" },
];

export function FlowSidebar({
  activeCategory,
  onCategoryChange,
  counts,
}: Readonly<FlowSidebarProps>) {
  return (
    <aside
      aria-label="Route Scopes Sidebar"
      className="w-64 border-r border-border bg-content1/80 backdrop-blur-md flex flex-col justify-between p-3 select-none flex-shrink-0 z-20 overflow-y-auto"
    >
      {/* Top Section: Category Menu */}
      <div className="space-y-4">
        <div>
          <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-muted uppercase">
            Route Scopes
          </div>
          <nav aria-label="Category Scopes" className="mt-1 space-y-1">
            {CATEGORY_ITEMS.map((item) => {
              const isActive = activeCategory === item.id;
              const count = counts[item.id] || 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onCategoryChange(item.id)}
                  data-testid={testIds.flow.sidebarCategory(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-foreground hover:bg-content2/80 font-medium"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="text-xs font-mono truncate">
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] font-mono truncate leading-tight ${
                        isActive ? "text-primary-foreground/80" : "text-muted"
                      }`}
                    >
                      {item.scope}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-content2 text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Archetype Legend & Info */}
      <div className="pt-4 border-t border-border/80 space-y-3">
        <div>
          <div className="px-2.5 text-[10px] font-bold tracking-wider text-muted uppercase mb-1.5">
            Expo Router Archetypes
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {ARCHETYPES.map((arch) => (
              <div
                key={arch.label}
                className="flex flex-col p-1.5 rounded-lg bg-content2/40 border border-border/40"
              >
                <span className="text-[10px] font-mono font-semibold text-foreground truncate">
                  {arch.label}
                </span>
                <span className="text-[9px] text-muted truncate">
                  {arch.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monorepo Architecture Badge */}
        <div className="px-2.5 py-2 rounded-xl bg-content2/50 border border-border/50 text-[10px] text-muted leading-relaxed">
          <div className="font-semibold text-foreground mb-0.5">
            Expo Router v57
          </div>
          <div>Hierarchical DAG auto-laid out with Dagre top-to-bottom.</div>
        </div>
      </div>
    </aside>
  );
}

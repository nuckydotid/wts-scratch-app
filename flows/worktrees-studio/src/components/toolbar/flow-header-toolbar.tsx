import React from "react";
import { useTheme } from "@repo/worktrees-studio-ds";
import type { ScreenCategory } from "../../data/screens-tree-data";

interface FlowHeaderToolbarProps {
  activeCategory: ScreenCategory | "all";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFitView: () => void;
  counts: Record<ScreenCategory | "all", number>;
  viewMode: "layout" | "navigation";
  onViewModeChange: (mode: "layout" | "navigation") => void;
  layoutDirection: "TB" | "LR";
  onLayoutDirectionChange: (dir: "TB" | "LR") => void;
  showAuxiliary: boolean;
  onToggleAuxiliary: () => void;
  edgeCount: number;
}

const CATEGORY_NAMES: Record<ScreenCategory | "all", string> = {
  all: "All Screens",
  root: "Root & System",
  public: "Public / Auth",
  admin: "Admin Portal",
  member: "Member Portal",
  staff: "Staff Portal",
  e2e: "E2E Mocks",
};

export function FlowHeaderToolbar({
  activeCategory,
  searchQuery,
  onSearchChange,
  onFitView,
  counts,
  viewMode,
  onViewModeChange,
  layoutDirection,
  onLayoutDirectionChange,
  showAuxiliary,
  onToggleAuxiliary,
  edgeCount,
}: Readonly<FlowHeaderToolbarProps>) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-content1/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-30 select-none">
      {/* Left: Branding & Current Scope Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-xs tracking-tighter">
            RK
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-foreground leading-none">
              Worktrees Studio Screen Tree
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
              {counts[activeCategory]} screens · {edgeCount} edges
            </span>
          </div>
          <p className="text-[10px] text-muted mt-0.5 leading-none">
            Scope:{" "}
            <span className="font-medium text-foreground">
              {CATEGORY_NAMES[activeCategory]}
            </span>
          </p>
        </div>
      </div>

      {/* Center: View Mode & Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Mode Switcher */}
        <div className="flex items-center bg-content2 p-0.5 rounded-lg border border-border">
          <button
            onClick={() => onViewModeChange("layout")}
            data-testid="mode-layout-tree"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "layout"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>📁</span>
            <span>Layout Tree</span>
          </button>
          <button
            onClick={() => onViewModeChange("navigation")}
            data-testid="mode-navigation-flow"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "navigation"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>🔀</span>
            <span>Navigation Flow</span>
          </button>
        </div>

        {/* Navigation Mode Sub-controls: Orientation & Auxiliary Toggle */}
        {viewMode === "navigation" && (
          <div className="flex items-center gap-1.5">
            {/* Orientation Toggle */}
            <div className="flex items-center bg-content2 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => onLayoutDirectionChange("TB")}
                data-testid="orientation-tb"
                title="Top to Bottom (Vertical)"
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  layoutDirection === "TB"
                    ? "bg-content1 text-foreground shadow-xs font-bold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ⬇️ TB
              </button>
              <button
                onClick={() => onLayoutDirectionChange("LR")}
                data-testid="orientation-lr"
                title="Left to Right (Horizontal)"
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  layoutDirection === "LR"
                    ? "bg-content1 text-foreground shadow-xs font-bold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ➡️ LR
              </button>
            </div>

            {/* Auxiliary Loops Toggle */}
            <button
              onClick={onToggleAuxiliary}
              data-testid="toggle-auxiliary-edges"
              title={
                showAuxiliary
                  ? "Hide Tab & Drawer Loops"
                  : "Show Tab & Drawer Loops"
              }
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                showAuxiliary
                  ? "border-sky-500/50 bg-sky-500/15 text-sky-500 font-bold"
                  : "border-border bg-content2/80 text-muted hover:text-foreground"
              }`}
            >
              <span>🔄</span>
              <span className="hidden md:inline">Loops</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Search, Fit View, and Theme Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <input
            type="text"
            placeholder="Search screens, routes, params..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="flow-search-input"
            className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-border bg-content2/80 text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              data-testid="flow-search-clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Fit View Button */}
        <button
          onClick={onFitView}
          title="Reset and Fit View"
          data-testid="flow-fit-view"
          className="h-8 px-2.5 rounded-lg border border-border bg-content2/80 hover:bg-content2 text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">Fit View</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          data-testid="flow-theme-toggle"
          className="h-8 w-8 rounded-lg border border-border bg-content2/80 hover:bg-content2 flex items-center justify-center text-foreground transition-colors text-sm"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}

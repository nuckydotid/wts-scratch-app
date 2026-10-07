import { Z_FLOW_EDGE, Z_FLOW_EDGE_HIGHLIGHTED } from "@repo/worktrees-studio-ds";
import React, { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { NavigationEdgeData } from "../../data/screens-tree-data";
import {
  TRANSITION_STROKE_COLOR,
  HIGHLIGHT_STROKE_COLOR,
  DIMMED_STROKE_COLOR,
} from "../../utils/flow-colors";

export type ExtendedNavigationEdgeData = NavigationEdgeData & {
  isDimmed?: boolean;
  isHighlighted?: boolean;
  points?: { x: number; y: number }[];
};

const TRANSITION_STYLES: Record<
  string,
  {
    stroke: string;
    chipBg: string;
    chipBorder: string;
    chipText: string;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
  }
> = {
  fork: {
    stroke: TRANSITION_STROKE_COLOR.fork, // purple-500
    chipBg: "bg-purple-950/80 dark:bg-purple-950/90",
    chipBorder: "border-purple-500/50 shadow-purple-500/20",
    chipText: "text-purple-200",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    badgeText: "text-purple-300",
    badgeLabel: "FORK",
  },
  push: {
    stroke: TRANSITION_STROKE_COLOR.push, // emerald-500
    chipBg: "bg-emerald-950/80 dark:bg-emerald-950/90",
    chipBorder: "border-emerald-500/50 shadow-emerald-500/20",
    chipText: "text-emerald-200",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    badgeText: "text-emerald-300",
    badgeLabel: "PUSH",
  },
  replace: {
    stroke: TRANSITION_STROKE_COLOR.replace, // amber-500
    chipBg: "bg-amber-950/80 dark:bg-amber-950/90",
    chipBorder: "border-amber-500/50 shadow-amber-500/20",
    chipText: "text-amber-200",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    badgeText: "text-amber-300",
    badgeLabel: "REPLACE",
  },
  redirect: {
    stroke: TRANSITION_STROKE_COLOR.redirect, // slate-500
    chipBg: "bg-slate-900/80 dark:bg-slate-900/90",
    chipBorder: "border-slate-500/50 shadow-slate-500/20",
    chipText: "text-slate-200",
    badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    badgeText: "text-slate-300",
    badgeLabel: "REDIRECT",
  },
  tab: {
    stroke: TRANSITION_STROKE_COLOR.tab, // sky-600
    chipBg: "bg-sky-950/80 dark:bg-sky-950/90",
    chipBorder: "border-sky-500/40 shadow-sky-500/15",
    chipText: "text-sky-200",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    badgeText: "text-sky-300",
    badgeLabel: "TAB",
  },
  drawer: {
    stroke: TRANSITION_STROKE_COLOR.drawer, // indigo-400
    chipBg: "bg-indigo-950/80 dark:bg-indigo-950/90",
    chipBorder: "border-indigo-500/40 shadow-indigo-500/15",
    chipText: "text-indigo-200",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    badgeText: "text-indigo-300",
    badgeLabel: "DRAWER",
  },
  sheet: {
    stroke: TRANSITION_STROKE_COLOR.sheet, // pink-500
    chipBg: "bg-pink-950/80 dark:bg-pink-950/90",
    chipBorder: "border-pink-500/40 shadow-pink-500/15",
    chipText: "text-pink-200",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    badgeText: "text-pink-300",
    badgeLabel: "SHEET",
  },
  teleport: {
    stroke: TRANSITION_STROKE_COLOR.teleport, // violet-500
    chipBg: "bg-violet-950/80 dark:bg-violet-950/90",
    chipBorder: "border-violet-500/40 shadow-violet-500/15",
    chipText: "text-violet-200",
    badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    badgeText: "text-violet-300",
    badgeLabel: "TELEPORT",
  },
  "bottom-sheet": {
    stroke: TRANSITION_STROKE_COLOR["bottom-sheet"], // pink-500
    chipBg: "bg-pink-950/80 dark:bg-pink-950/90",
    chipBorder: "border-pink-500/40 shadow-pink-500/15",
    chipText: "text-pink-200",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    badgeText: "text-pink-300",
    badgeLabel: "BOTTOM_SHEET",
  },
  "full-sheet": {
    stroke: TRANSITION_STROKE_COLOR["full-sheet"], // violet-500
    chipBg: "bg-violet-950/80 dark:bg-violet-950/90",
    chipBorder: "border-violet-500/40 shadow-violet-500/15",
    chipText: "text-violet-200",
    badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    badgeText: "text-violet-300",
    badgeLabel: "FULL_SHEET",
  },
};

function getStrokeColor(
  isHighlighted: boolean,
  isDimmed: boolean,
  defaultColor: string,
): string {
  if (isHighlighted) return HIGHLIGHT_STROKE_COLOR;
  if (isDimmed) return DIMMED_STROKE_COLOR;
  return defaultColor;
}

function getStrokeWidth(isHighlighted: boolean, isAux: boolean): number {
  if (isHighlighted) return 2.5;
  if (isAux) return 1.25;
  return 2;
}

function getOpacity(isDimmed: boolean, isAux: boolean): number {
  if (isDimmed) return 0.25;
  if (isAux) return 0.65;
  return 1;
}

function buildEdgeTooltip(edgeData: ExtendedNavigationEdgeData): string {
  let text = `${edgeData.source} ➔ ${edgeData.target}`;
  if (edgeData.trigger) {
    text += ` via ${edgeData.trigger}`;
  }
  if (edgeData.testID) {
    text += ` [${edgeData.testID}]`;
  }
  return text;
}

function getDisplayText(
  edgeData: ExtendedNavigationEdgeData,
  transitionType: string,
  fallbackBadgeLabel: string,
): string {
  if (
    (transitionType === "fork" ||
      transitionType === "teleport" ||
      transitionType === "sheet" ||
      transitionType === "bottom-sheet" ||
      transitionType === "full-sheet") &&
    edgeData.label
  ) {
    return edgeData.label;
  }
  if (edgeData.testID) {
    return `🎯 ${edgeData.testID}`;
  }
  return edgeData.label || edgeData.trigger || fallbackBadgeLabel;
}

interface Point {
  x: number;
  y: number;
}

function filterDuplicatePoints(points: Point[]): Point[] {
  if (points.length <= 1) return points;
  const clean: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = clean.at(-1);
    const curr = points[i];
    if (prev && Math.hypot(curr.x - prev.x, curr.y - prev.y) > 0.5) {
      clean.push(curr);
    }
  }
  return clean;
}

function buildRoundedPolylineSvgPath(
  rawPoints: Point[],
  borderRadius = 16,
): string {
  const points = filterDuplicatePoints(rawPoints);
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];

    const dIn = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
    const dOut = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y);
    const r = Math.min(borderRadius, dIn / 2, dOut / 2);

    if (r < 1) {
      d += ` L ${pCurr.x} ${pCurr.y}`;
      continue;
    }

    const uInX = (pCurr.x - pPrev.x) / dIn;
    const uInY = (pCurr.y - pPrev.y) / dIn;
    const uOutX = (pNext.x - pCurr.x) / dOut;
    const uOutY = (pNext.y - pCurr.y) / dOut;

    const cross = uInX * uOutY - uInY * uOutX;
    if (Math.abs(cross) < 0.01) {
      continue;
    }

    const startCurveX = pCurr.x - uInX * r;
    const startCurveY = pCurr.y - uInY * r;
    const endCurveX = pCurr.x + uOutX * r;
    const endCurveY = pCurr.y + uOutY * r;

    d += ` L ${startCurveX} ${startCurveY} Q ${pCurr.x} ${pCurr.y} ${endCurveX} ${endCurveY}`;
  }

  const last = points.at(-1);
  if (last) {
    d += ` L ${last.x} ${last.y}`;
  }
  return d;
}

function findPolylineMidpoint(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  let totalLength = 0;
  const segmentLengths: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const dist = Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y,
    );
    segmentLengths.push(dist);
    totalLength += dist;
  }

  const halfLength = totalLength / 2;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const len = segmentLengths[i];
    if (accumulated + len >= halfLength) {
      const remaining = halfLength - accumulated;
      const ratio = len === 0 ? 0 : remaining / len;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    accumulated += len;
  }

  return points.at(-1) ?? { x: 0, y: 0 };
}

function computeCorridorPoints(
  source: Point,
  target: Point,
  dagrePoints: Point[],
  isHorizontal: boolean,
): Point[] {
  const intermediate = dagrePoints.slice(1, -1);
  const result: Point[] = [source];

  const firstPt = intermediate[0];
  if (isHorizontal) {
    result.push({ x: firstPt.x, y: source.y }, { x: firstPt.x, y: firstPt.y });
  } else {
    result.push({ x: source.x, y: firstPt.y }, { x: firstPt.x, y: firstPt.y });
  }

  for (let i = 1; i < intermediate.length; i++) {
    result.push(intermediate[i]);
  }

  const lastPt = intermediate.at(-1) ?? firstPt;
  if (isHorizontal) {
    result.push({ x: lastPt.x, y: target.y }, target);
  } else {
    result.push({ x: target.x, y: lastPt.y }, target);
  }

  return result;
}

interface EdgePathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition: EdgeProps["sourcePosition"];
  targetX: number;
  targetY: number;
  targetPosition: EdgeProps["targetPosition"];
  points?: Point[];
}

function getEdgePathAndCoords(
  params: EdgePathParams,
): [path: string, labelX: number, labelY: number] {
  const {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    points,
  } = params;
  const isHorizontal = sourcePosition === "right" || sourcePosition === "left";

  if (points && points.length > 3) {
    const corridorPoints = computeCorridorPoints(
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
      points,
      isHorizontal,
    );
    const path = buildRoundedPolylineSvgPath(corridorPoints, 16);
    const midpoint = findPolylineMidpoint(corridorPoints);
    return [path, midpoint.x, midpoint.y];
  }

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 24,
    centerX: isHorizontal ? points?.[1]?.x : undefined,
    centerY: !isHorizontal ? points?.[1]?.y : undefined,
  });

  return [path, labelX, labelY];
}

export const NavigationEdge = memo(function NavigationEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
}: EdgeProps) {
  const edgeData =
    (data as unknown as ExtendedNavigationEdgeData | undefined) ??
    ({} as ExtendedNavigationEdgeData);
  const transitionType = edgeData.transitionType || "push";
  const conf = TRANSITION_STYLES[transitionType] || TRANSITION_STYLES.push;

  const [edgePath, labelX, labelY] = getEdgePathAndCoords({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    points: edgeData.points,
  });

  const isAux = Boolean(edgeData.isAuxiliary);
  const isDimmed = Boolean(edgeData.isDimmed);
  const isHighlighted = Boolean(edgeData.isHighlighted);

  const strokeColor = getStrokeColor(isHighlighted, isDimmed, conf.stroke);
  const strokeWidth = getStrokeWidth(isHighlighted, isAux);
  const strokeDasharray = isAux ? "5,5" : undefined;
  const opacity = getOpacity(isDimmed, isAux);
  const tooltipText = buildEdgeTooltip(edgeData);

  // Derive chip display text (prioritize descriptive branch labels for forks)
  const displayText = getDisplayText(edgeData, transitionType, conf.badgeLabel);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          opacity,
          transition: "stroke 0.2s, stroke-width 0.2s, opacity 0.2s",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isDimmed ? "none" : "all",
            opacity,
            zIndex: isHighlighted ? Z_FLOW_EDGE_HIGHLIGHTED : Z_FLOW_EDGE,
          }}
          className="group cursor-default select-none transition-opacity duration-200"
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md transition-all duration-200 ${conf.chipBg} ${conf.chipBorder} ${
              isHighlighted
                ? "ring-2 ring-sky-400 scale-105"
                : "hover:scale-105"
            }`}
            title={tooltipText}
          >
            <span
              className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border uppercase tracking-wider ${conf.badgeBg}`}
            >
              {conf.badgeLabel}
            </span>

            <span
              className={`text-[9px] font-mono font-medium max-w-[130px] truncate ${conf.chipText}`}
            >
              {displayText}
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

NavigationEdge.displayName = "NavigationEdge";

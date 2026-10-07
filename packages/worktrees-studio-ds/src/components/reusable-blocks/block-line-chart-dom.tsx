"use dom";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type BlockChartDataPoint = {
  x: number;
  y: number;
};

export type BlockChartSeries = {
  id: string;
  label: string;
  color: string;
  data: BlockChartDataPoint[];
};

export type BlockLineChartDomProps = {
  series: BlockChartSeries[];
  height?: number;
  dom?: {
    matchContents?: boolean;
  };
};

/** Fixed light-chart chrome (DOM component renders its own canvas). */
const CHART_CHROME = {
  grid: "#e5e7eb",
  tick: "#9ca3af",
  tooltipBackground: "rgba(255, 255, 255, 0.95)",
  tooltipShadow: "0 2px 8px rgba(0,0,0,0.08)",
} as const;

export default function BlockLineChartDom({ series = [], height = 220 }: BlockLineChartDomProps) {
  // Combine all series data points indexed by x
  const chartData = useMemo(() => {
    const xMap = new Map<number, Record<string, number | null>>();

    for (const s of series) {
      for (const pt of s.data) {
        let row = xMap.get(pt.x);
        if (!row) {
          row = { x: pt.x };
          xMap.set(pt.x, row);
        }
        row[s.id] = pt.y;
      }
    }

    return Array.from(xMap.values()).sort((a, b) => (a.x as number) - (b.x as number));
  }, [series]);

  const isTimestamp = useMemo(() => {
    return series.some((s) => s.data.some((d) => d.x > 10000000000));
  }, [series]);

  const formatXAxis = (tick: number) => {
    if (isTimestamp && tick > 10000000000) {
      return new Date(tick).toLocaleDateString("id-ID", { month: "short" });
    }
    return String(tick);
  };

  const formatTooltipLabel = (label: any) => {
    if (typeof label === "number" && isTimestamp && label > 10000000000) {
      return new Date(label).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return String(label ?? "");
  };

  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
          <XAxis
            dataKey="x"
            tickFormatter={formatXAxis}
            stroke={CHART_CHROME.tick}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: CHART_CHROME.grid }}
          />
          <YAxis
            stroke={CHART_CHROME.tick}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            labelFormatter={formatTooltipLabel}
            formatter={(value: any, name: any) => {
              const matchingSeries = series.find((s) => s.id === name || s.label === name);
              return [value, matchingSeries?.label ?? name];
            }}
            contentStyle={{
              backgroundColor: CHART_CHROME.tooltipBackground,
              border: `1px solid ${CHART_CHROME.grid}`,
              borderRadius: "8px",
              boxShadow: CHART_CHROME.tooltipShadow,
              fontSize: "12px",
              padding: "6px 10px",
            }}
          />
          {series.map((s) => (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.id}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

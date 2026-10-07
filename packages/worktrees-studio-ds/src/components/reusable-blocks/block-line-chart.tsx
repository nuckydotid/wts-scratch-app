import React from "react";
import { UiView, UiText } from "../heroui-primitive";
import BlockLineChartDom, {
  type BlockChartSeries,
  type BlockChartDataPoint,
} from "./block-line-chart-dom";

export type { BlockChartSeries, BlockChartDataPoint };

export type BlockLineChartProps = {
  title?: string;
  series: BlockChartSeries[];
  height?: number;
  /** X tick label formatter (optional) */
  xFormatter?: (value: number) => string;
  /** Y tick label formatter (optional) */
  yFormatter?: (value: number) => string;
  testID?: string;
};

/**
 * General multi-series line chart rendered via Expo DOM Components and Recharts.
 * Runs in DOM context on web and lightweight DOM component on native with 0 C++ bindings.
 * i18n-free: all strings come from the host via props.
 */
export function BlockLineChart({ title, series = [], height = 220, testID }: BlockLineChartProps) {
  return (
    <UiView testID={testID} className="gap-3">
      {title ? <UiText className="text-base font-semibold text-foreground">{title}</UiText> : null}
      {series.length > 0 && (
        <UiView className="flex-row flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <UiView key={s.id} className="flex-row items-center gap-1.5">
              <UiView className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <UiText className="text-xs text-muted">{s.label}</UiText>
            </UiView>
          ))}
        </UiView>
      )}
      <UiView style={{ height, minHeight: height }}>
        <BlockLineChartDom series={series} height={height} dom={{ matchContents: true }} />
      </UiView>
    </UiView>
  );
}

export default BlockLineChart;

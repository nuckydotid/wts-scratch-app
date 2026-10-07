import { PICKER_SETTLE_MS } from "../../lib/animation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { format, getDaysInMonth, setDate, setMonth, setYear } from "date-fns";
import { UiView, UiText, UiButton } from "../heroui-primitive";

const ITEM_H = 48;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

type Props = {
  value?: Date;
  title?: string;
  confirmLabel: string;
  confirmTestID?: string;
  minYear?: number;
  maxYear?: number;
  /** "date" = day/month/year wheels (default); "month" = month/year only. */
  mode?: "date" | "month";
  /** 12 full month labels (host-localized); defaults to English "MMMM". */
  monthLabels?: string[];
  onConfirm: (date: Date) => void;
};

interface WheelItem {
  label: string;
  value: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

interface PickerColumnProps {
  items: WheelItem[];
  selectedValue: number;
  onValueChange: (v: number) => void;
  flex?: number;
  /** Deterministic testID per wheel row (E2E taps a row to select it). */
  itemTestID?: (item: WheelItem, index: number) => string;
}

const PickerColumn = React.memo(function PickerColumn({
  items,
  selectedValue,
  onValueChange,
  flex = 1,
  itemTestID,
}: PickerColumnProps) {
  const scrollRef = useRef<ScrollView & { getNode?: () => ScrollView }>(null);
  const scrollY = useSharedValue(0);
  const lastEmitted = useRef<number>(-1);
  const initialised = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === selectedValue);
    const y = Math.max(0, idx) * ITEM_H;
    scrollY.set(y);
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
      initialised.current = true;
    }, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialised.current) return;
    const idx = items.findIndex((i) => i.value === selectedValue);
    if (idx < 0) return;
    scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    []
  );

  const emitFromY = useCallback(
    (y: number) => {
      if (items.length === 0) return;
      const idx = clamp(Math.round(y / ITEM_H), 0, items.length - 1);
      const item = items[idx];
      if (lastEmitted.current !== idx && item) {
        lastEmitted.current = idx;
        onValueChange(item.value);
      }
    },
    [items, onValueChange]
  );

  const snapToNearest = useCallback(() => {
    const y = scrollY.value;
    if (items.length === 0) return;
    const idx = clamp(Math.round(y / ITEM_H), 0, items.length - 1);
    const target = idx * ITEM_H;
    if (Math.abs(y - target) > 1) {
      scrollRef.current?.scrollTo({ y: target, animated: true });
      lastEmitted.current = idx;
      const item = items[idx];
      if (item) onValueChange(item.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, onValueChange]);

  const recordScrollJs = useCallback(
    (y: number) => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(snapToNearest, PICKER_SETTLE_MS);
    },
    [snapToNearest]
  );

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
    runOnJS(recordScrollJs)(e.contentOffset.y);
  });

  return (
    <UiView style={{ height: PICKER_H, overflow: "hidden", flex }}>
      <Animated.ScrollView
        ref={scrollRef as React.RefObject<ScrollView & { getNode?: () => ScrollView }>}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // Wheel pickers don't rubber-band at the ends.
        overScrollMode="never"
        bounces={false}
        decelerationRate="fast"
        snapToInterval={ITEM_H}
        contentContainerStyle={{ paddingVertical: PAD }}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e) => {
          emitFromY(e.nativeEvent.contentOffset.y);
          snapToNearest();
        }}
        onScrollEndDrag={(e) => {
          emitFromY(e.nativeEvent.contentOffset.y);
          snapToNearest();
        }}
      >
        {items.map((item, index) => (
          <PickerCell
            key={item.value}
            index={index}
            label={item.label}
            testID={itemTestID?.(item, index)}
            scrollY={scrollY}
            onPress={() => {
              const y = index * ITEM_H;
              scrollRef.current?.scrollTo({ y, animated: true });
              lastEmitted.current = index;
              onValueChange(item.value);
            }}
          />
        ))}
      </Animated.ScrollView>
    </UiView>
  );
});

interface PickerCellProps {
  index: number;
  label: string;
  testID?: string;
  scrollY: SharedValue<number>;
  onPress: () => void;
}

function PickerCell({ index, label, testID, scrollY, onPress }: PickerCellProps) {
  const rStyle = useAnimatedStyle(() => {
    const dist = Math.abs(index - scrollY.value / ITEM_H);
    return {
      opacity: interpolate(dist, [0, 1, 2], [1, 0.42, 0.14], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(dist, [0, 1, 2], [1, 0.88, 0.72], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        height: ITEM_H,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
      }}
    >
      <Animated.View style={rStyle}>
        <UiText className="text-xl text-foreground text-center">{label}</UiText>
      </Animated.View>
    </Pressable>
  );
}

function SelectionIndicator() {
  return (
    <UiView
      pointerEvents="none"
      className="absolute top-0 left-2.5 right-2.5 bottom-0 justify-center"
    >
      <UiView className="h-12 rounded-[13px] bg-foreground/10" />
    </UiView>
  );
}

function DatePickerColumns({
  value,
  onChange,
  minYear,
  maxYear,
  mode = "date",
  monthLabels,
}: {
  value: Date;
  onChange: (d: Date) => void;
  minYear: number;
  maxYear: number;
  mode?: "date" | "month";
  monthLabels?: string[];
}) {
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();

  const daysInMonth = useMemo(() => getDaysInMonth(new Date(year, month)), [year, month]);

  const dayItems = useMemo<WheelItem[]>(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        label: pad2(i + 1),
        value: i + 1,
      })),
    [daysInMonth]
  );

  const monthItems = useMemo<WheelItem[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        label: monthLabels?.[i] ?? format(new Date(2000, i, 1), mode === "month" ? "MMMM" : "MMM"),
        value: i,
      })),
    [mode, monthLabels]
  );

  const yearItems = useMemo<WheelItem[]>(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
        label: String(minYear + i),
        value: minYear + i,
      })),
    [minYear, maxYear]
  );

  const clampedDay = clamp(day, 1, daysInMonth);

  return (
    <UiView className="flex-row items-center overflow-hidden relative" style={{ height: PICKER_H }}>
      <SelectionIndicator />
      {mode === "month" ? (
        <>
          <PickerColumn
            items={monthItems}
            selectedValue={month}
            onValueChange={(m) => onChange(setDate(setMonth(value, m), 1))}
            itemTestID={(item) => `date-picker-month-${item.value}`}
            flex={2}
          />
          <PickerColumn
            items={yearItems}
            selectedValue={year}
            onValueChange={(y) => onChange(setYear(setDate(value, 1), y))}
            itemTestID={(item) => `date-picker-year-${item.value}`}
            flex={1.4}
          />
        </>
      ) : (
        <>
          <PickerColumn
            items={dayItems}
            selectedValue={clampedDay}
            onValueChange={(d) => onChange(setDate(value, d))}
            flex={0.9}
          />
          <PickerColumn
            items={monthItems}
            selectedValue={month}
            onValueChange={(m) => onChange(setMonth(value, m))}
            flex={1.5}
          />
          <PickerColumn
            items={yearItems}
            selectedValue={year}
            onValueChange={(y) => onChange(setYear(value, y))}
            flex={1.2}
          />
        </>
      )}
    </UiView>
  );
}

export function TeleportDatePickerView({
  value = new Date(),
  title,
  confirmLabel,
  confirmTestID,
  minYear = new Date().getFullYear() - 80,
  maxYear = new Date().getFullYear() + 20,
  mode = "date",
  monthLabels,
  onConfirm,
}: Props) {
  const [internal, setInternal] = useState(() => (mode === "month" ? setDate(value, 1) : value));

  return (
    <UiView className="gap-4">
      {title && <UiText className="text-xl font-semibold text-foreground">{title}</UiText>}
      <DatePickerColumns
        value={internal}
        onChange={setInternal}
        minYear={minYear}
        maxYear={maxYear}
        mode={mode}
        monthLabels={monthLabels}
      />
      <UiButton
        testID={confirmTestID}
        variant="primary"
        className="w-full"
        onPress={() => onConfirm(internal)}
      >
        {confirmLabel}
      </UiButton>
    </UiView>
  );
}

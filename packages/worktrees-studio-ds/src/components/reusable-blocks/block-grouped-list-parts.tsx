import { UiSkeleton, UiView } from "../heroui-primitive";

/** Rounded-group class for a row at the given position within its group —
 * single source of truth for the grouped-card rounding (shared by
 * `BlockGroupedList` rows, the virtualized templates, and the picker). */
export function groupedRowClass(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return "rounded-2xl";
  if (isFirst) return "rounded-t-2xl";
  if (isLast) return "rounded-b-2xl";
  return "";
}

/** Skeleton row shapes — each matches the real row layout of the screens
 * that use it (a generic student-list skeleton is wrong for score/report
 * rows): `default` avatar rows (student lists), `chevron` name+subtitle rows,
 * `icon-card` square-icon shortcut cards, `pill` name + score pill rows,
 * `report` name + letter pill + value rows, `stats` name + stat blocks. */
export type GroupedListSkeletonVariant =
  "default" | "chevron" | "icon-card" | "pill" | "report" | "stats" | "media" | "growth";

const PULSE = "pulse";
const pulse = (className: string) => <UiSkeleton isLoading variant={PULSE} className={className} />;

function SkeletonChevron() {
  return pulse("w-5 h-5 rounded-full");
}

/** Skeleton rows for a rounded group (loading state) — the same visual the
 * map and virtualized list engines render, shaped like the real rows via
 * `variant`. */
export function GroupedListSkeleton({
  rowCount = 1,
  variant = "default",
  className,
  flatTop,
}: {
  rowCount?: number;
  variant?: GroupedListSkeletonVariant;
  className?: string;
  /** The group has a pinned header row above — the first skeleton row then
   * rounds only at the bottom (the header owns the top rounding). */
  flatTop?: boolean;
}) {
  if (variant === "media") {
    return (
      <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <UiView
            key={i}
            className={`bg-surface overflow-hidden ${groupedRowClass(
              i === 0 && !flatTop,
              i === rowCount - 1
            )}`}
          >
            {!flatTop && (
              <UiView className="flex-row items-center px-4 py-3.5 gap-3 border-b border-separator/30">
                {pulse("w-10 h-10 rounded-full")}
                <UiView className="flex-1 gap-1.5">
                  {pulse("w-1/3 h-4 rounded-md")}
                  {pulse("w-1/4 h-3 rounded-md")}
                </UiView>
                {pulse("w-20 h-3 rounded-md")}
              </UiView>
            )}
            <UiView className="items-center justify-center p-3">
              {pulse("w-full h-64 rounded-xl")}
            </UiView>
            <UiView className="px-4 py-3.5 gap-2">
              {pulse("w-3/4 h-4 rounded-md")}
              {pulse("w-1/2 h-3 rounded-md")}
              <UiView className="flex-row gap-2 mt-1">
                {pulse("w-20 h-6 rounded-full")}
                {pulse("w-24 h-6 rounded-full")}
              </UiView>
            </UiView>
          </UiView>
        ))}
      </UiView>
    );
  }

  return (
    <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
      {Array.from({ length: rowCount }).map((_, i) => (
        <UiView
          key={i}
          className={`bg-surface flex-row items-center px-4 py-3 gap-3 ${groupedRowClass(
            i === 0 && !flatTop,
            i === rowCount - 1
          )}`}
        >
          {variant === "default" && (
            <>
              {pulse("w-12 h-12 rounded-full")}
              <UiView className="flex-1 min-w-0 gap-0.5">
                {pulse("w-2/3 h-4 rounded-md")}
                {pulse("w-1/3 h-3 rounded-md")}
              </UiView>
              <SkeletonChevron />
            </>
          )}
          {variant === "chevron" && (
            <>
              <UiView className="flex-1 gap-2">
                {pulse("w-1/2 h-4 rounded-md")}
                {pulse("w-1/4 h-3 rounded-md")}
              </UiView>
              <SkeletonChevron />
            </>
          )}
          {variant === "icon-card" && (
            <>
              {pulse("w-12 h-12 rounded-xl")}
              <UiView className="flex-1 gap-2">
                {pulse("w-1/2 h-4 rounded-md")}
                {pulse("w-1/3 h-3 rounded-md")}
              </UiView>
              <SkeletonChevron />
            </>
          )}
          {variant === "pill" && (
            <>
              <UiView className="flex-1">{pulse("w-1/2 h-4 rounded-md")}</UiView>
              {pulse("w-8 h-6 rounded-md")}
            </>
          )}
          {variant === "report" && (
            <>
              <UiView className="flex-1">{pulse("w-1/2 h-4 rounded-md")}</UiView>
              {pulse("w-8 h-6 rounded-md")}
              <SkeletonChevron />
            </>
          )}
          {variant === "stats" && (
            <UiView className="flex-1 gap-2">
              {pulse("w-1/3 h-4 rounded-md")}
              <UiView className="flex-row gap-2">
                <UiView className="flex-1 rounded-xl bg-muted/10 px-3 py-2 items-center justify-center">
                  {pulse("w-8 h-6 rounded-md")}
                </UiView>
                <UiView className="flex-1 rounded-xl bg-muted/10 px-3 py-2 items-center justify-center">
                  {pulse("w-8 h-6 rounded-md")}
                </UiView>
                <UiView className="flex-1 rounded-xl bg-muted/10 px-3 py-2 items-center justify-center">
                  {pulse("w-8 h-6 rounded-md")}
                </UiView>
              </UiView>
            </UiView>
          )}
          {variant === "growth" && (
            <UiView className="flex-1 gap-2">
              {pulse("w-1/3 h-4 rounded-md")}
              <UiView className="flex-row items-center gap-2">
                <UiView className="items-center gap-0.5">
                  {pulse("w-4 h-2 rounded-md")}
                  {pulse("w-14 h-6 rounded-lg")}
                </UiView>
                <UiView className="w-px h-6 bg-separator/30" />
                <UiView className="items-center gap-0.5">
                  {pulse("w-4 h-2 rounded-md")}
                  {pulse("w-14 h-6 rounded-lg")}
                </UiView>
                <UiView className="w-px h-6 bg-separator/30" />
                <UiView className="items-center gap-0.5">
                  {pulse("w-4 h-2 rounded-md")}
                  {pulse("w-14 h-6 rounded-lg")}
                </UiView>
              </UiView>
            </UiView>
          )}
        </UiView>
      ))}
    </UiView>
  );
}

/** 1px separator between virtualized rows — the FlatList twin of `gap-px`. */
export function GroupedListSeparator() {
  return <UiView className="h-px" />;
}

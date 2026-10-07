import { Profiler, type ReactNode } from "react";

type DevProfilerProps = {
  /** Unique identifier shown in the DevTools Profiler tab flame graph. Use the
   *  format `ScreenName.SectionName`, e.g. "ParentHomeTab.ChildList". */
  id: string;
  children: ReactNode;
};

/**
 * Dev-only `React.Profiler` wrapper.
 *
 * In production builds this renders a transparent passthrough with zero
 * overhead — the `__DEV__` branch is eliminated by the bundler.
 *
 * In development, it emits named render boundaries into the React DevTools
 * Profiler tab so you can see exactly how long each screen section takes to
 * mount or update. It also logs a console warning for renders that exceed
 * one frame (16 ms), which helps catch accidental expensive re-renders early.
 *
 * ## Usage
 * ```tsx
 * import { DevProfiler } from "@repo/worktrees-studio-ds";
 *
 * function TeacherGradesHubScreen(props: Props) {
 *   return (
 *     <TemplateFlatListScreen ...>
 *       <DevProfiler id="TeacherGradesHub.SubjectList">
 *         <BlockGroupedList ... />
 *       </DevProfiler>
 *     </TemplateFlatListScreen>
 *   );
 * }
 * ```
 *
 * ## DevTools — how to use
 * 1. Open React Native DevTools from Metro (press `j` or open via the Dev Menu).
 * 2. Switch to the **Profiler** tab.
 * 3. Click ⏺ to start recording, interact with the screen, click ⏹ to stop.
 * 4. Named bars labelled with your `id` will appear in the flame graph.
 */
export function DevProfiler({ id, children }: DevProfilerProps) {
  if (!__DEV__) return <>{children}</>;
  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}

function onRenderCallback(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number
) {
  // Only warn for renders that exceed one 60 fps frame (16.7 ms). This is the
  // threshold at which the JS thread starts dropping frames.
  if (actualDuration > 16) {
    console.warn(
      `[DevProfiler] ${id} — ${phase} — actual: ${actualDuration.toFixed(1)} ms` +
        ` (base: ${baseDuration.toFixed(1)} ms) ⚠️ exceeded 16ms frame budget`
    );
  }
}

import { useCallback } from "react";
import { UiView, MonoText, UiPressable, UiIcon } from "../../components";
import { useAppFont, FONT_NAMES } from "../../hooks/use-font";
import { useTheme } from "../../components/providers/theme-provider";

export function Toolbar() {
  const { theme, toggleTheme } = useTheme();
  const { selectedFont, setSelectedFont } = useAppFont();
  const isDark = theme === "dark";

  const cycleFont = useCallback(() => {
    const idx = FONT_NAMES.findIndex((f) => f.key === selectedFont);
    setSelectedFont(FONT_NAMES[(idx + 1) % FONT_NAMES.length].key);
  }, [selectedFont, setSelectedFont]);

  return (
    <UiView className="flex-row items-center justify-between px-4 py-2.5 bg-background">
      <MonoText className="text-sm font-semibold text-foreground">worktrees-studio-ds</MonoText>
      <UiView className="flex-row items-center gap-2">
        <UiPressable
          onPress={cycleFont}
          accessibilityRole="button"
          accessibilityLabel={`Current font: ${selectedFont}. Tap to cycle.`}
          className="flex-row items-center gap-1 px-2 py-1 rounded-md"
        >
          <MonoText className="text-xs text-foreground">{selectedFont}</MonoText>
          <UiIcon name="swap-horizontal" size={12} className="text-foreground" />
        </UiPressable>
        <UiPressable
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 rounded-lg items-center justify-center"
        >
          <UiIcon name={isDark ? "sunny" : "moon"} size={20} className="text-foreground" />
        </UiPressable>
      </UiView>
    </UiView>
  );
}

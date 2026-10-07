import { useRef } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import type { View } from "react-native";
import { UiView } from "../../components";
import { ActiveFontProvider, useAppFont, FONT_MAP, type FontName } from "../../hooks/use-font";
import { CollabFrameLayers } from "../collab";

function cssVars(font: FontName): Record<string, string> {
  const f = FONT_MAP[font];
  return {
    "--font-normal": `"${f.normal}", sans-serif`,
    "--font-medium": `"${f.medium}", sans-serif`,
    "--font-semibold": `"${f.semibold}", sans-serif`,
    "--font-bold": `"${f.bold}", sans-serif`,
  };
}

/**
 * `story` (for example `blocks/block-chat-bubble`) turns on collaboration for this frame: teammates' cursors and
 * comment pins are drawn over it, positioned relative to the frame so they are right at any zoom.
 */
export default function PhoneFrame({ children, story }: { children: ReactNode; story?: string }) {
  const { selectedFont } = useAppFont();
  const vars = Platform.OS === "web" ? cssVars(selectedFont) : {};
  const frameRef = useRef<View>(null);

  return (
    <UiView
      ref={frameRef}
      className="w-[375px] h-[812px] bg-background border-4 border-separator overflow-hidden"
      style={vars}
    >
      <UiView className="flex-1">
        <ActiveFontProvider>{children}</ActiveFontProvider>
      </UiView>
      {story ? <CollabFrameLayers frame={frameRef} story={story} /> : null}
    </UiView>
  );
}

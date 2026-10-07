import { useCallback, useContext, useRef, type ReactNode } from "react";
import type { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiView, UiText, UiPressable, UiIcon } from "../heroui-primitive";
import { TeleportContext } from "../teleport";
import type { TeleportMenuItem } from "../teleport";
import { MENU_WIDTH } from "../teleport/teleport-menu-view";

type Props = {
  title: string;
  subtitle?: string;
  headerTestID?: string;
  titleTestID?: string;
  showBack?: boolean;
  showHamburger?: boolean;
  right?: ReactNode;
  menuItems?: TeleportMenuItem[];
  isBusy?: boolean;
  onPressBack?: () => void;
  onPressHamburger?: () => void;
  backTestID?: string;
  backA11yLabel: string;
  menuTestID?: string;
  menuTriggerTestID?: string;
  moreActionsA11yLabel: string;
  menuA11yLabel: string;
};

/** Layout constants the three-dot menu positioning math depends on — shared
 * with the storyboard's navbar-menu overlay so case previews land at the same
 * coordinates as a real click. */
export const NAVBAR_MENU_WIDTH = MENU_WIDTH;
export const NAVBAR_MENU_GAP = 6;
export const NAVBAR_HEIGHT = 56;
export const NAVBAR_PADDING_X = 16;

export function BlockNavBar({
  title,
  subtitle,
  headerTestID,
  titleTestID,
  showBack = true,
  showHamburger,
  right,
  menuItems,
  isBusy,
  onPressBack,
  onPressHamburger,
  backTestID,
  menuTestID,
  menuTriggerTestID,
  menuA11yLabel,
  backA11yLabel,
  moreActionsA11yLabel,
}: Props) {
  const insets = useSafeAreaInsets();
  const dimmed = isBusy ? "opacity-40" : "";
  const hasMenu = !!menuItems?.length;

  const teleport = useContext(TeleportContext);
  const menuTriggerRef = useRef<View>(null);

  const openMenu = useCallback(() => {
    if (!teleport || !menuItems?.length) return;
    teleport.measureInOverlay(menuTriggerRef.current, ({ x, y, width, height }) => {
      teleport.showMenu({
        x: x + width - NAVBAR_MENU_WIDTH,
        y: y + height + NAVBAR_MENU_GAP,
        width: NAVBAR_MENU_WIDTH,
        items: menuItems,
      });
    });
  }, [menuItems, teleport]);

  return (
    // Full-bleed card strip: surface fill + shadow, no border. The h-14 row
    // and NAVBAR_HEIGHT menu math stay untouched.
    <UiView className="w-full bg-surface shadow-overlay" style={{ paddingTop: insets.top }}>
      <UiView className="flex-row items-center px-4 h-14">
        <UiView className="w-10 self-stretch">
          {showHamburger && (
            <UiPressable
              accessibilityRole="button"
              accessibilityLabel={menuA11yLabel}
              testID={menuTestID}
              disabled={isBusy}
              onPress={onPressHamburger}
              className={`flex-1 justify-center items-center ${dimmed}`}
            >
              <UiIcon name="menu" size={28} className={isBusy ? "text-muted" : "text-foreground"} />
            </UiPressable>
          )}
          {!showHamburger && showBack && (
            <UiPressable
              accessibilityRole="button"
              accessibilityLabel={backA11yLabel}
              testID={backTestID}
              disabled={isBusy}
              onPress={onPressBack}
              className={`flex-1 justify-center items-center ${dimmed}`}
            >
              <UiIcon
                name="chevron-back"
                size={22}
                className={isBusy ? "text-muted" : "text-foreground"}
              />
            </UiPressable>
          )}
        </UiView>
        <UiView testID={headerTestID} className="flex-1 items-center justify-center min-w-0 px-1">
          <UiText
            testID={titleTestID}
            className="text-base font-semibold text-foreground text-center"
            numberOfLines={1}
          >
            {title}
          </UiText>
          {subtitle ? (
            <UiText className="text-xs text-muted text-center" numberOfLines={1}>
              {subtitle}
            </UiText>
          ) : null}
        </UiView>
        <UiView
          className={`w-10 flex-row items-center justify-end gap-1 self-stretch ${dimmed}`}
          pointerEvents={isBusy ? "none" : "auto"}
        >
          {right}
          {!right && hasMenu && (
            <UiPressable
              ref={menuTriggerRef}
              accessibilityRole="button"
              accessibilityLabel={moreActionsA11yLabel}
              testID={menuTriggerTestID}
              onPress={openMenu}
              className="p-1 self-stretch justify-center items-center"
            >
              <UiIcon name="ellipsis-vertical" size={22} className="text-foreground" />
            </UiPressable>
          )}
        </UiView>
      </UiView>
    </UiView>
  );
}

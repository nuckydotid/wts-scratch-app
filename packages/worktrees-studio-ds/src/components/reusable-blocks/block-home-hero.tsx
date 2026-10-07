import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import { UiButton, UiIcon, UiText, UiView } from "../heroui-primitive";
import { BlockGuidanceTip } from "./block-guidance-tip";

type Props = {
  welcome: string;
  hint?: string;
  /** Scan CTA label; the CTA is hidden when omitted. */
  scanLabel?: string;
  characterImage?: string;
  characterSize?: number;
  onPressScan?: () => void;
  onPressAnnouncement?: () => void;
  scanButtonTestID?: string;
  announcementButtonTestID?: string;
  announcementHasUnread?: boolean;
  announcementBadge?: number;
  announcementBadgeTestID?: string;
};

/**
 * Accent hero for role home screens — character art with guidance tip bubble, welcome copy,
 * and a primary scan action.
 */
export function BlockHomeHero({
  welcome,
  hint,
  scanLabel,
  characterImage,
  characterSize = 150,
  onPressScan,
  onPressAnnouncement,
  scanButtonTestID,
  announcementButtonTestID,
  announcementHasUnread,
  announcementBadge,
  announcementBadgeTestID = "home-hero-announcement-badge",
}: Props) {
  const badgeLabel =
    announcementBadge != null && announcementBadge > 0
      ? announcementBadge > 99
        ? "99+"
        : String(announcementBadge)
      : undefined;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useSafeAreaFrame();
  // Align the CTA's right edge with the centered scan button (max-w-xs = 320,
  // p-4 container): the scan button sits at half the remaining width.
  const announcementRightInset = Math.max(16, (windowWidth - 320) / 2);

  return (
    <UiView className="bg-accent" style={{ paddingTop: insets.top }}>
      {onPressAnnouncement ? (
        <UiView
          className="absolute top-0 right-0 z-10"
          style={{ paddingTop: insets.top + 8, paddingRight: announcementRightInset }}
        >
          <UiView className="relative">
            <UiButton
              variant="secondary"
              size="sm"
              isIconOnly
              onPress={onPressAnnouncement}
              testID={announcementButtonTestID}
              className="rounded-full"
            >
              <UiIcon name="notifications" size={18} className="text-accent-soft-foreground" />
            </UiButton>
            {badgeLabel ? (
              <UiView
                testID={announcementBadgeTestID}
                className="absolute -top-1 -right-1 bg-danger rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 border border-white"
              >
                <UiText className="text-xs font-bold text-white">{badgeLabel}</UiText>
              </UiView>
            ) : announcementHasUnread ? (
              <UiView
                testID={announcementBadgeTestID}
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger border border-white"
              />
            ) : null}
          </UiView>
        </UiView>
      ) : null}
      <UiView className="items-center p-4 gap-3">
        <BlockGuidanceTip
          imageUrl={characterImage}
          message={welcome}
          imagePosition="center"
          imageWidth={Math.min(characterSize, 220)}
          imageAspectRatio={669 / 373}
          className="mt-0 w-full max-w-xs"
        />
        {hint ? (
          <UiText className="font-semibold text-base text-center text-accent-foreground leading-6 px-1">
            {hint}
          </UiText>
        ) : null}
        {scanLabel ? (
          <UiButton
            variant="secondary"
            onPress={onPressScan}
            testID={scanButtonTestID}
            className="w-full max-w-xs"
          >
            <UiView className="flex-row items-center justify-center gap-2">
              <UiIcon name="scan-outline" size={22} className="text-accent-soft-foreground" />
              <UiButton.Label>{scanLabel}</UiButton.Label>
            </UiView>
          </UiButton>
        ) : null}
      </UiView>
    </UiView>
  );
}

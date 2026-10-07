import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import { UiView, UiText, UiSkeleton } from "../heroui-primitive";
import { BlockRetry } from "./block-retry";
import { BlockSkeletonFade } from "./block-skeleton-fade";

export type IdCardRow = {
  label: string;
  value: string;
};

type Props = {
  photoUrl?: string | null;
  /** Identity rows rendered in the card's data box (name/NIS/NISN/birth …). */
  rows: IdCardRow[];
  /** Brand header lines under the logo (e.g. "RAUDHATUL ATHFAL"). */
  headerLines?: string[];
  /** Value encoded in the QR — the school claim/verify URL built by the host. */
  qrValue: string;
  /** Card background art (seeded deterministic crop per student, school parity). */
  backgroundUrl?: string;
  logoUrl?: string;
  /** Seed for the deterministic background crop (e.g. NIS). */
  seed?: string;
  /** Tinted overlay on top of the background art (school parity green). */
  overlayTint?: string;
  /** Used for the photo placeholder initial. */
  name?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
};

const CARD_WIDTH = 320;
const CARD_HEIGHT = 507;
const BG_W = 1309;
const BG_H = 768;

/** Fixed print-card palette (not theme-driven — matches the physical ID card). */
const ID_CARD_COLORS = {
  headerBackground: "#4CAF50",
  headerText: "#FFFFFF",
  photoBackground: "#e4e4e7",
  photoBorder: "#FFFFFF",
  rowLabel: "#2E7D32",
  rowValue: "#1B3A20",
  qrBackground: "#f4f4f5",
  shadow: "#000",
} as const;

function seededInt(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) >>> 0;
  }
  return h % (max + 1);
}

function CardFace({
  photoUrl,
  rows,
  headerLines,
  qrValue,
  backgroundUrl,
  logoUrl,
  seed,
  overlayTint,
  name,
}: {
  photoUrl?: string | null;
  rows: IdCardRow[];
  headerLines?: string[];
  qrValue: string;
  backgroundUrl?: string;
  logoUrl?: string;
  seed?: string;
  overlayTint?: string;
  name?: string;
}) {
  const bgOffsetX = seededInt(`${seed}x`, BG_W - CARD_WIDTH);
  const bgOffsetY = seededInt(`${seed}y`, BG_H - CARD_HEIGHT);

  return (
    <UiView
      className="w-[320px] h-[507px] rounded-2xl overflow-hidden"
      style={{
        backgroundColor: ID_CARD_COLORS.headerBackground,
        shadowColor: ID_CARD_COLORS.shadow,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {backgroundUrl ? (
        <Image
          source={{ uri: backgroundUrl }}
          style={{
            position: "absolute",
            width: BG_W,
            height: BG_H,
            top: -bgOffsetY,
            left: -bgOffsetX,
          }}
          contentFit="cover"
        />
      ) : null}
      {overlayTint ? (
        <UiView style={[StyleSheet.absoluteFill, { backgroundColor: overlayTint }]} />
      ) : null}

      <UiView className="flex-1 items-center px-4 py-4">
        <UiView className="items-center mb-3">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: 48, height: 48, marginBottom: 6 }}
              contentFit="contain"
            />
          ) : null}
          {headerLines?.map((line) => (
            <UiText
              key={line}
              style={{
                color: ID_CARD_COLORS.headerText,
                fontSize: 13,
                lineHeight: 18,
                letterSpacing: 0.5,
              }}
              className="text-center font-bold"
            >
              {line}
            </UiText>
          ))}
        </UiView>

        <UiView className="flex-1 items-center justify-center mb-2.5">
          <UiView
            className="h-full items-center justify-center overflow-hidden"
            style={{
              aspectRatio: 3 / 4,
              borderRadius: 10,
              backgroundColor: ID_CARD_COLORS.photoBackground,
              borderWidth: 3,
              borderColor: ID_CARD_COLORS.photoBorder,
            }}
          >
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <UiText className="text-5xl font-bold text-muted">
                {name?.trim().charAt(0).toUpperCase() || "?"}
              </UiText>
            )}
          </UiView>
        </UiView>

        <UiView
          className="w-full bg-white px-3 py-2 flex-row items-center gap-3 mt-2.5"
          style={{ borderRadius: 10 }}
        >
          <UiView className="flex-1">
            {rows.map((row) => (
              <UiView key={row.label} style={{ paddingVertical: 3 }}>
                <UiText
                  className="font-semibold"
                  style={{ color: ID_CARD_COLORS.rowLabel, fontSize: 9, lineHeight: 12 }}
                >
                  {row.label}
                </UiText>
                <UiText style={{ color: ID_CARD_COLORS.rowValue, fontSize: 11, lineHeight: 15 }}>
                  {row.value}
                </UiText>
              </UiView>
            ))}
          </UiView>
          <UiView
            className="p-1"
            style={{ backgroundColor: ID_CARD_COLORS.qrBackground, borderRadius: 6 }}
          >
            <QRCode value={qrValue} size={80} />
          </UiView>
        </UiView>
      </UiView>
    </UiView>
  );
}

/**
 * ID-1 portrait identity card (school parity geometry 320×507): tinted
 * background art with a seeded deterministic crop, brand header, large 3:4
 * photo, white data box with identity rows + QR. General data block with the
 * loading-states contract: `isLoading` renders a card-shaped pulse skeleton
 * (no layout shift), `isError` a `BlockRetry` centered inside the card
 * surface. All strings/URLs come from the host; capture/share wiring lives
 * with the host screen.
 */
function IdCard({
  photoUrl,
  rows,
  headerLines,
  qrValue,
  backgroundUrl,
  logoUrl,
  seed,
  overlayTint = "rgba(34, 120, 56, 0.58)",
  name,
  isLoading,
  isError,
  onRetry,
  retryLabel,
  retryTitle,
}: Props) {
  if (isLoading) {
    return (
      <UiView
        className="w-[320px] h-[507px] rounded-2xl overflow-hidden bg-surface p-4 items-center"
        style={{
          shadowColor: ID_CARD_COLORS.shadow,
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <UiView className="items-center gap-1.5 mb-3">
          <UiSkeleton isLoading variant="pulse" className="w-12 h-12 rounded-full mb-1" />
          <UiSkeleton isLoading variant="pulse" className="w-32 h-3.5 rounded-md" />
          <UiSkeleton isLoading variant="pulse" className="w-32 h-3.5 rounded-md" />
        </UiView>
        <UiView className="flex-1 items-center justify-center mb-2.5 w-full">
          <UiSkeleton
            isLoading
            variant="pulse"
            style={{ height: "100%", aspectRatio: 3 / 4, borderRadius: 10 }}
          />
        </UiView>
        <UiSkeleton
          isLoading
          variant="pulse"
          className="w-full h-28"
          style={{ borderRadius: 10 }}
        />
      </UiView>
    );
  }

  if (isError) {
    return (
      <UiView className="w-[320px] h-[507px] rounded-2xl overflow-hidden bg-surface items-center justify-center p-8">
        <BlockRetry onRetry={onRetry} label={retryLabel} title={retryTitle} />
      </UiView>
    );
  }

  return (
    <CardFace
      photoUrl={photoUrl}
      rows={rows}
      headerLines={headerLines}
      qrValue={qrValue}
      backgroundUrl={backgroundUrl}
      logoUrl={logoUrl}
      seed={seed}
      overlayTint={overlayTint}
      name={name}
    />
  );
}

export function BlockIdCard(props: Props) {
  return (
    <BlockSkeletonFade isLoading={!!props.isLoading}>
      {(showSkeleton) => <IdCard {...props} isLoading={showSkeleton} isError={props.isError} />}
    </BlockSkeletonFade>
  );
}

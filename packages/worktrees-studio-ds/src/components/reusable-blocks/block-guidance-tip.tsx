import { Image } from "expo-image";
import { UiView, UiText } from "../heroui-primitive";

const PLACEHOLDER = require("../../../assets/images/icon.png");

type Props = {
  imageUrl?: string;
  message: string;
  imagePosition?: "left" | "right" | "center";
  imageSize?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageAspectRatio?: number;
  className?: string;
};

export function BlockGuidanceTip({
  imageUrl,
  message,
  imagePosition = "right",
  imageSize = 150,
  imageWidth,
  imageHeight,
  imageAspectRatio,
  className,
}: Props) {
  const source = imageUrl ? { uri: imageUrl } : PLACEHOLDER;
  const isCenter = imagePosition === "center";
  const alignClass = isCenter
    ? "items-center"
    : imagePosition === "left"
      ? "items-start"
      : "items-end";

  const width = imageWidth ?? imageSize;
  const height = imageHeight ?? (imageAspectRatio ? width / imageAspectRatio : imageSize);

  return (
    <UiView className={`mt-8 ${alignClass} ${className ?? ""}`.trim()}>
      <Image
        source={source}
        style={{ width, height }}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <UiView className="w-full -mt-2 rounded-2xl border border-amber-700/70 px-4 py-3 bg-amber-100 dark:bg-amber-950 dark:border-amber-600/60">
        <UiText
          className={`text-sm text-amber-900 dark:text-amber-100 leading-5 ${
            isCenter ? "text-center" : ""
          }`.trim()}
        >
          {message}
        </UiText>
      </UiView>
    </UiView>
  );
}

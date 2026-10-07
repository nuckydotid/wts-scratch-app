import { UiText, UiView } from "../heroui-primitive";

export type BlockChatBubbleProps = {
  text: string;
  isSender: boolean;
  formattedTime: string;
  senderName?: string;
  testID?: string;
};

/**
 * Reusable message bubble for chat conversations (incoming / outgoing).
 * - Sender (outgoing): right-aligned, tinted with accent.
 * - Receiver (incoming): left-aligned, surface card, displays sender name.
 */
export function BlockChatBubble({
  text,
  isSender,
  formattedTime,
  senderName,
  testID,
}: BlockChatBubbleProps) {
  return (
    <UiView
      testID={testID}
      className={`flex-row ${isSender ? "justify-end" : "justify-start"} px-4 mb-2.5`}
    >
      <UiView
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isSender
            ? "bg-accent/15 rounded-tr-sm"
            : "bg-card border border-separator/60 rounded-tl-sm"
        }`}
      >
        {senderName && (
          <UiText className="text-[11px] font-semibold text-accent mb-0.5" numberOfLines={1}>
            {senderName}
          </UiText>
        )}
        <UiText className="text-[10px] text-muted">{formattedTime}</UiText>
        <UiText className="text-sm mt-1 text-foreground leading-5">{text}</UiText>
      </UiView>
    </UiView>
  );
}

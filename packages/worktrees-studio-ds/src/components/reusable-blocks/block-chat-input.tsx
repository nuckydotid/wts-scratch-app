import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiIcon, UiInput, UiPressable, UiView } from "../heroui-primitive";

export type BlockChatInputProps = {
  placeholder?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  inputTestID?: string;
  sendTestID?: string;
  value?: string;
  onChangeText?: (text: string) => void;
};

/**
 * Pinned message composer bar for chat screens.
 * Contains multiline text input and a rounded send button with safe-area spacing.
 */
export function BlockChatInput({
  placeholder = "",
  onSend,
  disabled = false,
  inputTestID = "chat-input-field",
  sendTestID = "chat-send-btn",
  value,
  onChangeText,
}: BlockChatInputProps) {
  const insets = useSafeAreaInsets();
  const [internalText, setInternalText] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const text = value !== undefined ? value : internalText;
  const setText = onChangeText ?? setInternalText;

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    if (value === undefined) {
      setInternalText("");
    }
  };

  const bottomPadding = isKeyboardVisible ? 10 : Math.max(insets.bottom, 12);

  return (
    <UiView
      className="flex-row items-center gap-2 px-4 py-2.5 bg-surface shadow-overlay"
      style={{ paddingBottom: bottomPadding }}
    >
      <UiView className="flex-1">
        <UiInput
          testID={inputTestID}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!disabled}
          className="min-h-[42px] max-h-[100px] py-2 px-3 text-sm rounded-xl bg-card border border-separator/70 text-foreground"
        />
        <UiView
          testID="chat-input-bottom-anchor"
          accessible
          accessibilityLabel="chat-input-bottom-anchor"
          style={{ height: 2, width: "100%" }}
        />
      </UiView>
      <UiPressable
        testID={sendTestID}
        onPress={handleSend}
        disabled={!canSend}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          canSend ? "bg-accent active:opacity-80" : "bg-muted/40"
        }`}
        accessibilityRole="button"
        accessibilityLabel=""
      >
        <UiIcon name="send" size={17} className="text-white ml-0.5" />
      </UiPressable>
    </UiView>
  );
}

import { BlockChatBubble, BlockChatInput, UiFlatList, UiText, UiView } from "@repo/worktrees-studio-ds";
import { testIds } from "@repo/worktrees-studio-shared-ids";
import { useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chat";
import { formatTime } from "@/lib/chat-state";
import type { Msg } from "@/lib/chat-state";

export default function ChatRoom(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useAuth((s) => s.user?.uid);
  const room = useChat((s) => s.rooms[id]);
  const messages = useChat((s) => s.messages[id]);
  const status = useChat((s) => s.status);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void useChat.getState().openRoom(id).catch(() => {});
    return () => useChat.getState().closeRoom();
  }, [id]);

  // The list is inverted (newest at the bottom), so it wants newest-first data.
  const data = useMemo(() => [...(messages ?? [])].reverse(), [messages]);

  const send = (body: string) => {
    setError(null);
    setText("");
    useChat.getState().send(id, body).catch((e) => {
      setText(body);
      setError(e instanceof Error ? e.message : String(e));
    });
  };

  return (
    <UiView className="flex-1 bg-background" testID={testIds.screen("home") + "-chat-room"}>
      <UiView className="border-b border-border p-4">
        <UiText className="text-lg font-semibold text-foreground">{room?.name ?? "Chat"}</UiText>
        {status !== "online" ? <UiText className="text-xs text-muted">Reconnecting…</UiText> : null}
      </UiView>
      <UiFlatList<Msg>
        inverted
        data={data}
        keyExtractor={(m) => String(m.id)}
        onEndReached={() => void useChat.getState().loadOlder(id)}
        renderItem={({ item }) => (
          <BlockChatBubble text={item.body} isSender={item.from === uid} formattedTime={formatTime(item.at)} senderName={item.from === uid ? undefined : item.from} testID={testIds.chat.bubble(String(item.id))} />
        )}
      />
      {error ? <UiText className="px-4 text-sm text-danger">{error}</UiText> : null}
      <BlockChatInput value={text} onChangeText={setText} onSend={send} placeholder="Message…" />
    </UiView>
  );
}

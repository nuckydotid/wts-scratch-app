import { BlockEmptyState, UiButton, UiFlatList, UiInput, UiPressable, UiText, UiView } from "@repo/worktrees-studio-ds";
import { testIds } from "@repo/worktrees-studio-shared-ids";
import { useRouter } from "expo-router";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useChat } from "@/lib/chat";
import { formatTime, sortedRooms } from "@/lib/chat-state";
import type { Room } from "@/lib/chat-state";

export default function ChatList(): JSX.Element {
  const router = useRouter();
  const state = useChat();
  const rooms = sortedRooms(state);
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void useChat.getState().loadRooms().catch(() => {});
  }, []);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const uids = members.split(/[\s,]+/).filter(Boolean);
      const id = await useChat.getState().createRoom(name.trim(), uids);
      setName("");
      setMembers("");
      router.push({ pathname: "/chat/[id]", params: { id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <UiView className="flex-1 bg-background" testID={testIds.screen("home") + "-chat"}>
      <UiView className="gap-2 border-b border-border p-4">
        <UiText className="text-sm text-muted">{state.status === "online" ? "Online" : "Connecting…"}</UiText>
        <UiInput value={name} onChangeText={setName} placeholder="New chat name" testID="chat-new-name" />
        <UiInput value={members} onChangeText={setMembers} placeholder="Member user ids (comma separated)" autoCapitalize="none" testID="chat-new-members" />
        <UiButton onPress={() => void create()} isDisabled={busy || !name.trim()} testID="chat-create-btn">
          <UiButton.Label>Create chat</UiButton.Label>
        </UiButton>
        {error ? <UiText className="text-sm text-danger">{error}</UiText> : null}
      </UiView>
      <UiFlatList<Room>
        data={rooms}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<BlockEmptyState title="No chats yet" subtitle="Create one above and add teammates by user id." />}
        renderItem={({ item }) => (
          <UiPressable onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })} testID={testIds.chat.conversation(item.id)} className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <UiView className="flex-1">
              <UiText className="font-semibold text-foreground">{item.name}</UiText>
              <UiText className="text-sm text-muted" numberOfLines={1}>
                {item.last?.body ?? "No messages yet"}
              </UiText>
            </UiView>
            <UiView className="items-end gap-1">
              {item.last ? <UiText className="text-xs text-muted">{formatTime(item.last.at)}</UiText> : null}
              {item.unread > 0 ? <UiText className="text-xs font-bold text-accent">{item.unread}</UiText> : null}
            </UiView>
          </UiPressable>
        )}
      />
    </UiView>
  );
}

import { BlockChatBubble } from "../../../components/reusable-blocks/block-chat-bubble";
import { UiView } from "../../../components";
import type { ComponentDef } from "../heroui-primitive";

export const BlockChatBubbleBlock: ComponentDef = {
  label: "BlockChatBubble",
  category: "reusable-blocks",
  controls: {
    text: { type: "text", default: "Halo Bu Guru, besok masuk jam berapa ya?" },
    isSender: { type: "boolean", default: false },
    formattedTime: { type: "text", default: "Kamis, 20 Agt - 08:30" },
    senderName: { type: "text", default: "Ibu Siti (Wali Murid)" },
  },
  render: (p) => (
    <UiView className="p-4 bg-background w-[350px]">
      <BlockChatBubble
        text={p.text as string}
        isSender={p.isSender as boolean}
        formattedTime={p.formattedTime as string}
        senderName={p.senderName as string}
      />
    </UiView>
  ),
};

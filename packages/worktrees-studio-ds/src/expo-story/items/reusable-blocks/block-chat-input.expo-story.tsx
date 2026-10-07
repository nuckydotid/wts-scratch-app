import { BlockChatInput } from "../../../components/reusable-blocks/block-chat-input";
import { UiView } from "../../../components";
import type { ComponentDef } from "../heroui-primitive";

export const BlockChatInputBlock: ComponentDef = {
  label: "BlockChatInput",
  category: "reusable-blocks",
  controls: {
    placeholder: { type: "text", default: "Ketik obrolan..." },
    disabled: { type: "boolean", default: false },
  },
  render: (p) => (
    <UiView className="bg-background w-[375px]">
      <BlockChatInput
        placeholder={p.placeholder as string}
        disabled={p.disabled as boolean}
        onSend={() => {}}
      />
    </UiView>
  ),
};

import { BlockGuidanceTip } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockGuidanceTipBlock: ComponentDef = {
  label: "BlockGuidanceTip",
  category: "reusable blocks",
  controls: {
    imageUrl: C.txt(
      "https://worker.example.com/api/assets/characters/teacher-char.png"
    ),
    message: C.txt("Enter your registered email to receive a one-time verification code"),
    imagePosition: C.select(["left", "right", "center"], "right"),
  },
  render: (p) => (
    <BlockGuidanceTip
      imageUrl={p.imageUrl as string}
      message={p.message as string}
      imagePosition={p.imagePosition as "left" | "right" | "center"}
    />
  ),
};

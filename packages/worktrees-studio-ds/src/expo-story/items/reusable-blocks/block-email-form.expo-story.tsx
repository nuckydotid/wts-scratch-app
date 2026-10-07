import { BlockEmailForm } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockEmailFormBlock: ComponentDef = {
  label: "BlockEmailForm",
  category: "reusable blocks",
  controls: {
    email: C.txt("user@example.com"),
    emailError: C.txt(""),
    isLoading: C.bool(false),
    buttonLabel: C.txt("Send Code"),
  },
  render: (p) => (
    <BlockEmailForm
      emailLabel="Email"

      email={p.email as string}
      emailError={p.emailError as string}
      isLoading={Boolean(p.isLoading)}
      buttonLabel={p.buttonLabel as string}
    />
  ),
};

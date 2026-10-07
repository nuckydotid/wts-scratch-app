import { BlockOtpForm } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockOtpFormBlock: ComponentDef = {
  label: "BlockOtpForm",
  category: "reusable blocks",
  controls: {
    otp: C.txt(""),
    otpError: C.txt(""),
    isLoading: C.bool(false),
    buttonLabel: C.txt("Sign In"),
  },
  render: (p) => (
    <BlockOtpForm
      otpLabel="Enter OTP Code"

      otp={p.otp as string}
      otpError={p.otpError as string}
      isLoading={Boolean(p.isLoading)}
      buttonLabel={p.buttonLabel as string}
    />
  ),
};

import { BlockEmailForm, BlockOtpForm, BlockScreenHeader, UiText, UiView } from "../../../components";
import DragNode from "../../layouts/drag-node";
import PhoneFrame from "../../layouts/phone-frame";
import type { ComponentDef } from "./index";

const noop = () => {};

/**
 * Sample flow: several screens on one pan/zoom canvas (drag a screen, scroll to zoom). With collaboration on, teammates'
 * cursors and comment pins are drawn over the whole canvas and "follow" copies the leader's pan and zoom.
 * Replace the screens with the project's own flow.
 */
function Screen({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <UiView className="flex-1 justify-center bg-background p-6">
        <BlockScreenHeader title={title} subtitle={subtitle} />
        {children}
      </UiView>
    </PhoneFrame>
  );
}

export const SignUpFlowBlock: ComponentDef = {
  label: "Sign-up flow",
  category: "flows",
  render: () => (
    <UiView className="flex-row" style={{ width: 1500, height: 1000 }}>
      <DragNode id="sign-in-email" initialX={60} initialY={60} href="/expo-story/blocks/block-email-form" steps={["tapOn: Email field", "inputText: you@example.com", "tapOn: Email me a link"]}>
        <Screen title="Sign in" subtitle="We email you a one-time link.">
          <BlockEmailForm email="you@example.com" emailError="" isLoading={false} buttonLabel="Email me a link" emailLabel="Email" onChangeEmail={noop} onPressSendCode={noop} />
        </Screen>
      </DragNode>
      <DragNode id="sign-in-code" initialX={520} initialY={60} href="/expo-story/blocks/block-otp-form" steps={["assertVisible: Check your inbox", "tapOn: Verify"]}>
        <Screen title="Check your inbox" subtitle="Enter the code from the email.">
          <BlockOtpForm otp="123456" otpError="" isLoading={false} buttonLabel="Verify" otpLabel="Code" onChangeOtp={noop} onPressVerify={noop} />
        </Screen>
      </DragNode>
      <DragNode id="home" initialX={980} initialY={60} steps={["assertVisible: Hello"]}>
        <Screen title="Hello" subtitle="You are signed in.">
          <UiText className="text-muted">Home screen goes here.</UiText>
        </Screen>
      </DragNode>
    </UiView>
  ),
};

import { render } from "@testing-library/react-native";
import { BlockChatBubble } from "../block-chat-bubble";

describe("BlockChatBubble", () => {
  it("renders outgoing message from sender", async () => {
    const { getByTestId, getByText } = await render(
      <BlockChatBubble
        text="Halo Bu Guru"
        isSender={true}
        formattedTime="08:30"
        testID="test-bubble-1"
      />
    );

    expect(getByTestId("test-bubble-1")).toBeTruthy();
    expect(getByText("Halo Bu Guru")).toBeTruthy();
    expect(getByText("08:30")).toBeTruthy();
  });

  it("renders incoming message with sender name", async () => {
    const { getByTestId, getByText } = await render(
      <BlockChatBubble
        text="Waalaikumsalam, ada yang bisa dibantu?"
        isSender={false}
        formattedTime="08:31"
        senderName="Bu Aprin"
        testID="test-bubble-2"
      />
    );

    expect(getByTestId("test-bubble-2")).toBeTruthy();
    expect(getByText("Bu Aprin")).toBeTruthy();
    expect(getByText("Waalaikumsalam, ada yang bisa dibantu?")).toBeTruthy();
  });

  it("renders sender name on outgoing message as well", async () => {
    const { getByTestId, getByText } = await render(
      <BlockChatBubble
        text="Pesan dari saya"
        isSender={true}
        formattedTime="08:32"
        senderName="Saya Sendiri"
        testID="test-bubble-3"
      />
    );

    expect(getByTestId("test-bubble-3")).toBeTruthy();
    expect(getByText("Saya Sendiri")).toBeTruthy();
    expect(getByText("Pesan dari saya")).toBeTruthy();
  });
});

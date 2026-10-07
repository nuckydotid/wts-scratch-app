import { render, fireEvent } from "@testing-library/react-native";
import { BlockChatInput } from "../block-chat-input";

describe("BlockChatInput", () => {
  it("allows typing and sends message on press", async () => {
    const onSend = jest.fn();
    const { getByTestId } = await render(
      <BlockChatInput onSend={onSend} placeholder="Ketik obrolan..." />
    );

    await fireEvent.changeText(getByTestId("chat-input-field"), "Selamat pagi");
    expect(getByTestId("chat-input-bottom-anchor")).toBeDefined();
    await fireEvent.press(getByTestId("chat-send-btn"));

    expect(onSend).toHaveBeenCalledWith("Selamat pagi");
  });

  it("disables send when disabled prop is true", async () => {
    const onSend = jest.fn();
    const { getByTestId } = await render(<BlockChatInput onSend={onSend} disabled />);

    const input = getByTestId("chat-input-field");
    const sendBtn = getByTestId("chat-send-btn");

    await fireEvent.changeText(input, "Pesan tidak terkirim");
    await fireEvent.press(sendBtn);

    expect(onSend).not.toHaveBeenCalled();
  });

  it("handles keyboard show and hide listeners without crashing", async () => {
    const { unmount } = await render(<BlockChatInput onSend={jest.fn()} />);
    expect(() => unmount()).not.toThrow();
  });

  it("renders the composer bar as a borderless card surface", async () => {
    const r = await render(<BlockChatInput onSend={jest.fn()} />);
    const root = r.toJSON() as { props?: { className?: string } } | null;
    const className = root?.props?.className ?? "";
    expect(className).toContain("bg-surface");
    expect(className).toContain("shadow-overlay");
    expect(className).not.toContain("border-t");
    expect(className).not.toContain("border");
  });
});

import { fireEvent, render } from "@testing-library/react-native";
import { Keyboard, Text } from "react-native";

import { BlockDismissKeysArea } from "../block-dismiss-keys-area";

describe("BlockDismissKeysArea", () => {
  it("dismisses the keyboard when pressed", async () => {
    const dismiss = jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    const r = await render(
      <BlockDismissKeysArea>
        <Text>Some label</Text>
      </BlockDismissKeysArea>
    );
    await fireEvent.press(r.getByText("Some label"));
    expect(dismiss).toHaveBeenCalled();
    dismiss.mockRestore();
  });

  it("is not exposed to the accessibility tree", async () => {
    const r = await render(
      <BlockDismissKeysArea>
        <Text>Some label</Text>
      </BlockDismissKeysArea>
    );
    const json = JSON.stringify(r.toJSON());
    expect(json).toContain('"accessible":false');
  });
});

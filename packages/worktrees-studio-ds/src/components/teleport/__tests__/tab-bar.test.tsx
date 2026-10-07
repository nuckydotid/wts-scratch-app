import { render, fireEvent } from "@testing-library/react-native";
import { TeleportTabBarView, type TeleportTabBarConfig } from "../../../components/teleport";

const ITEMS: TeleportTabBarConfig["items"] = [
  { key: "home", icon: "https://x/home.png", label: "Home", testID: "tab-home" },
  { key: "messages", icon: "https://x/messages.png", label: "Messages", testID: "tab-messages" },
];

describe("TeleportTabBarView", () => {
  it("renders all items with labels", async () => {
    const { getByText } = await render(
      <TeleportTabBarView config={{ items: ITEMS, activeKey: "home", onPress: () => {} }} />
    );
    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Messages")).toBeTruthy();
  });

  it("shows a count badge when set", async () => {
    const items = [{ ...ITEMS[0] }, { ...ITEMS[1], badge: 3 }];
    const { getByText } = await render(
      <TeleportTabBarView config={{ items, activeKey: "home", onPress: () => {} }} />
    );
    expect(getByText("3")).toBeTruthy();
  });

  it("renders the bar as a borderless card surface", async () => {
    const r = await render(
      <TeleportTabBarView config={{ items: ITEMS, activeKey: "home", onPress: () => {} }} />
    );
    const json = JSON.stringify(r.toJSON());
    expect(json).toContain("bg-surface");
    expect(json).toContain("shadow-overlay");
    expect(json).not.toContain("rounded-");
    expect(json).not.toContain("borderTopWidth");
    expect(json).not.toContain("borderTopColor");
  });

  it("renders the dot variant and invokes onPress with the key", async () => {
    const items = [{ ...ITEMS[0] }, { ...ITEMS[1], dot: true }];
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <TeleportTabBarView config={{ items, activeKey: "home", onPress }} />
    );
    await fireEvent.press(getByTestId("tab-messages"));
    expect(onPress).toHaveBeenCalledWith("messages");
  });
});

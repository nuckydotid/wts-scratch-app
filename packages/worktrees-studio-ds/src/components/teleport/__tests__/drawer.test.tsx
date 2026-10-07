import { render, fireEvent, act } from "@testing-library/react-native";
import { Text } from "react-native";
import { TeleportProvider, useTeleport } from "../index";

function DrawerProbe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-drawer"
      onPress={() =>
        teleport.showDrawer({
          items: [
            {
              key: "profile",
              label: "Profil",
              icon: "person-circle-outline",
              testID: "drawer-profile",
              onPress: () => {},
            },
          ],
        })
      }
    >
      open
    </Text>
  );
}

describe("TeleportDrawer", () => {
  it("renders drawer items with their testIDs", async () => {
    const { getByTestId, getByText, toJSON } = await render(
      <TeleportProvider>
        <DrawerProbe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-drawer"));
    await act(async () => {});
    expect(getByText("Profil")).toBeTruthy();
    expect(getByTestId("drawer-profile")).toBeTruthy();

    // Borderless card surface: surface fill + shadow, no divider borders.
    const panels: { props: { className?: string; style?: unknown } }[] = [];
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const props = (node as { props?: { className?: unknown } }).props;
      if (typeof props?.className === "string" && props.className.includes("shadow-overlay")) {
        panels.push(node as { props: { className?: string; style?: unknown } });
      }
      const children = (node as { children?: unknown }).children;
      (Array.isArray(children) ? children : children ? [children] : []).forEach(walk);
    };
    const root = toJSON();
    (Array.isArray(root) ? root : [root]).forEach(walk);
    expect(panels).toHaveLength(1);
    const style = JSON.stringify(panels[0]?.props.style);
    expect(style).toContain("backgroundColor");
    expect(style).not.toContain("borderRightWidth");
    expect(style).not.toContain("borderRightColor");
  });

  it("mounts a fresh tree after an overlay open (awaited fireEvent rule)", async () => {
    // RNTL v14 fireEvent is async: an un-awaited press leaves the act queue
    // pending and every later render in the file mounts an empty tree. This
    // test guards the convention for the whole suite (issue #48).
    const plain = await render(<Text testID="plain-after-overlay">ok</Text>);
    expect(plain.getByTestId("plain-after-overlay")).toBeTruthy();
  });
});

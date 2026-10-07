import { userEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TeleportProvider, useTeleport } from "../index";

function OrderProbe() {
  const teleport = useTeleport();
  return (
    <>
      <Text
        testID="open-full"
        onPress={() =>
          teleport.showFullSheet(<Text testID="full-content">Full</Text>, undefined, {
            title: "Full",
            subtitle: "Detail",
          })
        }
      >
        f
      </Text>
      <Text
        testID="open-sheet"
        onPress={() => teleport.showBottomSheet(<Text testID="sheet-content">Sheet</Text>)}
      >
        s
      </Text>
      <Text
        testID="open-drawer"
        onPress={() =>
          teleport.showDrawer({
            items: [{ key: "x", label: "X", icon: "grid-outline" }],
          })
        }
      >
        d
      </Text>
    </>
  );
}

function treeOrder(json: string, a: string, b: string): boolean {
  return json.indexOf(a) > json.indexOf(b);
}

describe("TeleportOverlayOrder", () => {
  it("renders a bottom sheet in front of an already-open full sheet", async () => {
    const r = await render(
      <TeleportProvider>
        <OrderProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-full"));
    await user.press(r.getByTestId("open-sheet"));
    const json = JSON.stringify(r.toJSON());
    expect(treeOrder(json, '"sheet-content"', '"full-content"')).toBe(true);
  });

  it("renders a full sheet in front of an already-open bottom sheet", async () => {
    const r = await render(
      <TeleportProvider>
        <OrderProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await user.press(r.getByTestId("open-full"));
    const json = JSON.stringify(r.toJSON());
    expect(treeOrder(json, '"full-content"', '"sheet-content"')).toBe(true);
  });

  it("renders a drawer in front of an already-open full sheet", async () => {
    const r = await render(
      <TeleportProvider>
        <OrderProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-full"));
    await user.press(r.getByTestId("open-drawer"));
    const json = JSON.stringify(r.toJSON());
    const fullIndex = json.indexOf('"full-content"');
    const drawerLabelIndex = json.indexOf('"X"');
    expect(fullIndex).toBeGreaterThan(-1);
    expect(drawerLabelIndex).toBeGreaterThan(fullIndex);
  });
});

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { TeleportProvider, useTeleport } from "../index";
import { useTeleportMenu } from "../use-teleport-menu";
import type { TeleportMenuItem } from "../teleport-menu-view";

function MenuProbe({ items, y = 100 }: { items: TeleportMenuItem[]; y?: number }) {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-menu"
      onPress={() =>
        teleport.showMenu({
          x: 200,
          y,
          width: 260,
          items,
        })
      }
    >
      open
    </Text>
  );
}

function MenuTriggerProbe() {
  const { open } = useTeleportMenu();
  const triggerRef = useRef<View | null>(null);
  return (
    <Pressable ref={triggerRef} testID="open-menu" onPress={() => open(triggerRef, ITEMS)}>
      <Text>open</Text>
    </Pressable>
  );
}

beforeAll(() => {
  (View.prototype as any).measureInWindow = function (cb: any) {
    cb(0, 0, 180, 44);
  };
});

const ITEMS: TeleportMenuItem[] = [
  {
    key: "photo",
    label: "Change Profile Picture",
    subtitle: "Update your profile picture",
    icon: "camera-outline",
    testID: "menu-change-photo",
  },
  {
    key: "signout",
    label: "Log out",
    subtitle: "Sign out of your account",
    icon: "log-out-outline",
    danger: true,
    testID: "menu-sign-out",
  },
];

describe("TeleportMenu", () => {
  it("renders card items with icon, title, subtitle and their testIDs", async () => {
    const { getByTestId, getByText } = await render(
      <TeleportProvider>
        <MenuProbe items={ITEMS} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    await waitFor(() => getByText("Change Profile Picture"));
    expect(getByText("Update your profile picture")).toBeTruthy();
    expect(getByText("Log out")).toBeTruthy();
    expect(getByText("Sign out of your account")).toBeTruthy();
    expect(getByTestId("menu-change-photo")).toBeTruthy();
    expect(getByTestId("menu-sign-out")).toBeTruthy();
  });

  it("renders the leading icon for items with an icon", async () => {
    const { getByTestId } = await render(
      <TeleportProvider>
        <MenuProbe items={ITEMS} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    const tree = JSON.stringify(getByTestId("menu-change-photo").toJSON() ?? {});
    expect(tree).toContain("camera-outline");
  });

  it("marks the danger item with the danger text color", async () => {
    const { getByTestId, getByText } = await render(
      <TeleportProvider>
        <MenuProbe items={ITEMS} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    const label = await waitFor(() => getByText("Log out"));
    expect(String(label.props.className)).toContain("text-danger");
    const subtitle = getByText("Sign out of your account");
    expect(String(subtitle.props.className)).not.toContain("text-danger");
  });

  it("runs the item onPress and closes the menu", async () => {
    const onPress = jest.fn();
    const items: TeleportMenuItem[] = [{ key: "photo", label: "Change Profile Picture", onPress }];
    const { getByTestId, getByText, queryByText } = await render(
      <TeleportProvider>
        <MenuProbe items={items} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    await fireEvent.press(await waitFor(() => getByText("Change Profile Picture")));
    expect(onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(queryByText("Change Profile Picture")).toBeNull());
  });

  it("renders the panel below the trigger when it fits on screen", async () => {
    const { getByTestId } = await render(
      <TeleportProvider>
        <MenuProbe items={ITEMS} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    const panel = await waitFor(() => getByTestId("teleport-menu-panel"));
    // Frame is 812 tall; config.y = 100 → panel sits below the trigger.
    const top = Number(panel.props.style.find((s: object) => "top" in s)?.top);
    expect(top).toBeGreaterThan(100);
  });

  it("flips the panel above the trigger when it would overflow the bottom", async () => {
    const { getByTestId } = await render(
      <TeleportProvider>
        <MenuProbe items={ITEMS} y={740} />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    const panel = await waitFor(() => getByTestId("teleport-menu-panel"));
    const top = Number(panel.props.style.find((s: object) => "top" in s)?.top);
    expect(top).toBeLessThan(740);
  });
});

describe("useTeleportMenu", () => {
  it("defaults the panel width to the shared MENU_WIDTH", async () => {
    const { getByTestId } = await render(
      <TeleportProvider>
        <MenuTriggerProbe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("open-menu"));
    const panel = await waitFor(() => getByTestId("teleport-menu-panel"));
    const width = Number(panel.props.style.find((s: object) => "width" in s)?.width);
    expect(width).toBe(260);
  });
});

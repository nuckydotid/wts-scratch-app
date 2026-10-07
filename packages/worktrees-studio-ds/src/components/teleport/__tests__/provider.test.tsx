import { render, fireEvent, act } from "@testing-library/react-native";
import { Keyboard, Text } from "react-native";
import { TeleportProvider, useFullSheet, useTeleport } from "../index";

const showToastSpy = jest.fn();
const showSheetSpy = jest.fn();

function Probe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="probe"
      onPress={() => {
        showToastSpy();
        teleport.showToast({ variant: "danger", title: "Boom" });
        showSheetSpy();
        teleport.showBottomSheet(<Text>Sheet</Text>);
      }}
    >
      probe
    </Text>
  );
}

describe("TeleportProvider", () => {
  it("updates a fullsheet in place via the handle and closes it", async () => {
    function Probe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="probe"
          onPress={() => {
            // Open with skeleton content, then swap to the loaded content +
            // footer through handle.update — no second overlay stacks.
            const handle = teleport.showFullSheet(<Text>skeleton</Text>, undefined, {
              title: "Skeleton",
              subtitle: "Loading",
            });
            handle.update(<Text>loaded</Text>, <Text>footer</Text>);
            handle.close();
            handle.update(<Text>late-update</Text>);
          }}
        >
          probe
        </Text>
      );
    }
    const { getByTestId, queryByText } = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("probe"));
    // Closed by the handle: no overlay content remains (late-update was
    // applied to a closed sheet and renders nothing).
    expect(queryByText("late-update")).toBeNull();
    expect(queryByText("loaded")).toBeNull();
  });

  it("publishes content state to a footer via the fullsheet context", async () => {
    function ContentProbe() {
      const { setData } = useFullSheet<string>();
      return (
        <Text testID="content" onPress={() => setData("published")}>
          content
        </Text>
      );
    }
    function FooterProbe() {
      const { data, close } = useFullSheet<string>();
      return (
        <Text testID="footer" onPress={close}>
          footer:{data ?? "none"}
        </Text>
      );
    }
    function Probe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="probe"
          onPress={() =>
            teleport.showFullSheet(<ContentProbe />, <FooterProbe />, {
              title: "Probe",
              subtitle: "Detail",
            })
          }
        >
          probe
        </Text>
      );
    }
    const { getByTestId, getByText, queryByText } = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("probe"));
    expect(getByText("footer:none")).toBeTruthy();
    // Content publishes via setData → the footer consumer re-renders.
    await fireEvent.press(getByTestId("content"));
    expect(getByText("footer:published")).toBeTruthy();
    // Footer closes the sheet via context.close.
    await fireEvent.press(getByTestId("footer"));
    expect(queryByText("content")).toBeNull();
  });

  it("throws when useFullSheet is used outside a fullsheet", async () => {
    function BadProbe() {
      useFullSheet();
      return null;
    }
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      render(
        <TeleportProvider>
          <BadProbe />
        </TeleportProvider>
      )
    ).rejects.toThrow("useFullSheet must be used inside a fullsheet");
    errorSpy.mockRestore();
  });

  it("bottom-anchors toasts with the newest nearest the bottom", async () => {
    function MultiToastProbe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="multi-probe"
          onPress={() => {
            teleport.showToast({ variant: "default", title: "First toast" });
            teleport.showToast({ variant: "success", title: "Second toast" });
          }}
        >
          probe
        </Text>
      );
    }
    const { getByTestId, toJSON } = await render(
      <TeleportProvider>
        <MultiToastProbe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("multi-probe"));
    await act(async () => {});

    const json = JSON.stringify(toJSON());
    // Bottom band: newest toast renders last (closest to the bottom edge).
    expect(json).toContain('"bottom":0');
    expect(json.indexOf("First toast")).toBeGreaterThan(-1);
    expect(json.indexOf("First toast")).toBeLessThan(json.indexOf("Second toast"));
  });

  it("shows a bottom sheet and a toast through the context", async () => {
    const { getByTestId, getByText, toJSON } = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("probe"));
    await act(async () => {});
    expect(showToastSpy).toHaveBeenCalled();
    expect(showSheetSpy).toHaveBeenCalled();
    expect(getByText("Sheet")).toBeTruthy();
    expect(getByText("Boom")).toBeTruthy();

    // Borderless card surface: surface fill + shadow, no top divider.
    const root = toJSON();
    const json = JSON.stringify(root);
    expect(json).toContain("bg-surface");
    expect(json).toContain("rounded-t-2xl");
    expect(json).toContain("shadow-overlay");
    expect(json).not.toContain("border-t");
    expect(json).not.toContain("border-separator");
  });

  it("dismisses the keyboard when a bottom sheet opens", async () => {
    const dismiss = jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    const { getByTestId } = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );
    await fireEvent.press(getByTestId("probe"));
    await act(async () => {});
    expect(dismiss).toHaveBeenCalled();
    dismiss.mockRestore();
  });
});

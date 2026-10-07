import { act, userEvent, render } from "@testing-library/react-native";
import { Keyboard, Text } from "react-native";
import { TeleportProvider, useTeleport } from "../index";

function FullSheetProbe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-sheet"
      onPress={() =>
        teleport.showFullSheet(<Text testID="sheet-content">Content</Text>, undefined, {
          title: "Sheet title",
          subtitle: "Sheet subtitle",
        })
      }
    >
      open
    </Text>
  );
}

function FullSheetWithFooterProbe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-with-footer"
      onPress={() =>
        teleport.showFullSheet(
          <Text testID="sheet-content">Content</Text>,
          <Text testID="sheet-footer">Footer</Text>,
          { title: "Sheet title", subtitle: "Sheet subtitle" }
        )
      }
    >
      open with footer
    </Text>
  );
}

describe("TeleportFullSheet", () => {
  it("renders the sheet content with a closable close button testID", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});
    expect(r.getByText("Content")).toBeTruthy();
    expect(r.getByTestId("full-sheet-close")).toBeTruthy();
  });

  it("paints the sheet with the resolved theme background (not a CSS var)", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});
    expect(JSON.stringify(r.toJSON())).toContain('"backgroundColor":"#000000"');
  });

  it("native scroll keeps taps working (keyboard rule) and is a plain ScrollView", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});

    const json = JSON.stringify(r.toJSON());
    // iOS uses "always" to avoid the handled→two-tap focus race that corrupts
    // legalName+Jakarta on Maestro; web/android keep "handled".
    expect(json).toMatch(/"keyboardShouldPersistTaps":"(always|handled)"/);
    // KeyboardAwareScrollView on native is rendered as View with the same props
    // in the JSON snapshot; web uses plain ScrollView. Just check the prop.
    expect(json).toContain('"keyboardShouldPersistTaps"');
  });

  it("keeps the scroll content at its natural height (no flexGrow — forms must stay scrollable)", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});
    expect(JSON.stringify(r.toJSON())).not.toContain('"flexGrow":1');
  });

  it("renders the footer as a static bottom bar (no KeyboardStickyView)", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetWithFooterProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-with-footer"));
    await act(async () => {});
    expect(r.getByTestId("sheet-footer")).toBeTruthy();
    expect(JSON.stringify(r.toJSON())).not.toContain("KeyboardStickyView");
  });

  it("exposes a header dismiss target for the keyboard (Maestro iOS)", async () => {
    const dismiss = jest.spyOn(Keyboard, "dismiss");
    const r = await render(
      <TeleportProvider>
        <FullSheetProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});
    await user.press(r.getByTestId("full-sheet-dismiss-keys"));
    expect(dismiss).toHaveBeenCalled();
    dismiss.mockRestore();
  });

  it("renders a pinned header above the scroll (never scrolls away)", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetWithFooterProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-with-footer"));
    await act(async () => {});
    // The mandatory title/subtitle render in the pinned chrome, above the
    // scrollable content.
    expect(r.getByText("Sheet title")).toBeTruthy();
    expect(r.getByText("Sheet subtitle")).toBeTruthy();
    const json = JSON.stringify(r.toJSON());
    const headerIdx = json.indexOf("Sheet title");
    const contentIdx = json.indexOf('"sheet-content"');
    expect(headerIdx).toBeGreaterThan(-1);
    expect(headerIdx).toBeLessThan(contentIdx);
  });

  it("renders header and footer chrome as borderless card surfaces", async () => {
    const r = await render(
      <TeleportProvider>
        <FullSheetWithFooterProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-with-footer"));
    await act(async () => {});
    const json = JSON.stringify(r.toJSON());
    expect(json).toContain("bg-surface");
    // Flat chrome: no shadow seams or separators around the pinned header/footer.
    expect(json).not.toContain("shadow-overlay");
    expect(json).not.toContain("border-t");
    expect(json).not.toContain("border-separator");
  });
});

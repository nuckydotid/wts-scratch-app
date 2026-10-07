import { fireEvent, render, screen, cleanup } from "@testing-library/react-native";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { FullSheetContext } from "../teleport-context";
import { useFullSheetFooterAction } from "../use-full-sheet-footer-action";

let setDataCalls = 0;
let latestAction: (() => void) | undefined;
let handlerVersion = 0;

function Inner({ busy }: { busy: boolean }) {
  useFullSheetFooterAction({
    isBusy: busy,
    onAction: () => {
      handlerVersion += 1;
    },
  });
  return null;
}

function ProviderHarness({ busy }: { busy: boolean }) {
  const [, force] = useState(0);
  // New identities on every render, like the real provider value.
  const value = {
    data: {},
    setData: (data: { onAction?: () => void }) => {
      setDataCalls += 1;
      latestAction = data.onAction;
    },
    close: () => {},
    goBackStep: () => false,
    canStepBack: false,
  } as never;
  return (
    <FullSheetContext.Provider value={value}>
      <Inner busy={busy} />
      <Pressable testID="force-render" onPress={() => force((n) => n + 1)}>
        <Text>render</Text>
      </Pressable>
    </FullSheetContext.Provider>
  );
}

describe("useFullSheetFooterAction", () => {
  afterEach(() => {
    cleanup();
    setDataCalls = 0;
    latestAction = undefined;
    handlerVersion = 0;
  });

  it("publishes once on mount and on each busy flip, never per render", async () => {
    const { rerender } = await render(<ProviderHarness busy={false} />);
    expect(setDataCalls).toBe(1);

    // Unstable setData identities must not re-publish.
    for (let i = 0; i < 3; i++) {
      await fireEvent.press(screen.getByTestId("force-render"));
    }
    expect(setDataCalls).toBe(1);

    await rerender(<ProviderHarness busy />);
    expect(setDataCalls).toBe(2);
  });

  it("published onAction always calls the latest handler", async () => {
    await render(<ProviderHarness busy={false} />);
    latestAction?.();
    expect(handlerVersion).toBe(1);
  });
});

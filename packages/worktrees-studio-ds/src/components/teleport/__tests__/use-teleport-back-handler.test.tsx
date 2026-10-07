import { render, userEvent, act } from "@testing-library/react-native";
import { Text, BackHandler } from "react-native";
import { TeleportProvider, useTeleport, useFullSheet } from "../index";

describe("Teleport BackHandler & Step-Back Integration", () => {
  let backPressHandler: (() => boolean) | null = null;
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    backPressHandler = null;
    addEventListenerSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((event: string, handler: any) => {
        if (event === "hardwareBackPress") {
          backPressHandler = handler;
        }
        return { remove: jest.fn() } as any;
      });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  it("returns false when no overlays are active", async () => {
    await render(
      <TeleportProvider>
        <Text>Home</Text>
      </TeleportProvider>
    );

    expect(backPressHandler).not.toBeNull();
    const result = backPressHandler ? backPressHandler() : null;
    expect(result).toBe(false);
  });

  it("dismisses top bottom sheet and consumes hardware back", async () => {
    function Probe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="open-sheet"
          onPress={() => {
            teleport.showBottomSheet(<Text>Sheet Content</Text>);
          }}
        >
          open
        </Text>
      );
    }

    const r = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );

    const user = userEvent.setup();
    await user.press(r.getByTestId("open-sheet"));
    await act(async () => {});

    expect(r.queryByText("Sheet Content")).not.toBeNull();

    // Trigger hardware back
    let handled = false;
    await act(async () => {
      handled = backPressHandler ? backPressHandler() : false;
    });

    expect(handled).toBe(true);
    expect(r.queryByText("Sheet Content")).toBeNull();
  });

  it("steps back on multi-step fullsheet before closing", async () => {
    function WizardContent() {
      const { data } = useFullSheet<{ activeStep?: number }>();
      const step = data?.activeStep ?? 0;
      return <Text testID="wizard-step">Current Step: {step}</Text>;
    }

    function Probe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="open-wizard"
          onPress={() => {
            const handle = teleport.showFullSheet(<WizardContent />, undefined, {
              title: "Wizard",
              subtitle: "Step",
            });
            handle.setData({ activeStep: 2 });
          }}
        >
          open
        </Text>
      );
    }

    const r = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );

    const user = userEvent.setup();
    await user.press(r.getByTestId("open-wizard"));
    await act(async () => {});

    expect(r.getByTestId("wizard-step").props.children).toEqual(["Current Step: ", 2]);

    // Back press 1: from step 2 to step 1
    await act(async () => {
      const handled = backPressHandler ? backPressHandler() : false;
      expect(handled).toBe(true);
    });
    expect(r.getByTestId("wizard-step").props.children).toEqual(["Current Step: ", 1]);

    // Back press 2: from step 1 to step 0
    await act(async () => {
      const handled = backPressHandler ? backPressHandler() : false;
      expect(handled).toBe(true);
    });
    expect(r.getByTestId("wizard-step").props.children).toEqual(["Current Step: ", 0]);

    // Back press 3: from step 0 to sheet close
    await act(async () => {
      const handled = backPressHandler ? backPressHandler() : false;
      expect(handled).toBe(true);
    });
    expect(r.queryByText("Current Step: 0")).toBeNull();
  });

  it("handles LIFO order when menu is opened over a fullsheet", async () => {
    function Probe() {
      const teleport = useTeleport();
      return (
        <Text
          testID="open-stack"
          onPress={() => {
            teleport.showFullSheet(<Text>FullSheet</Text>, undefined, {
              title: "Full",
              subtitle: "Sheet",
            });
            teleport.showMenu({
              x: 10,
              y: 10,
              items: [{ key: "opt1", label: "Option 1" }],
            });
          }}
        >
          open
        </Text>
      );
    }

    const r = await render(
      <TeleportProvider>
        <Probe />
      </TeleportProvider>
    );

    const user = userEvent.setup();
    await user.press(r.getByTestId("open-stack"));
    await act(async () => {});

    expect(r.queryByText("Option 1")).not.toBeNull();
    expect(r.queryByText("FullSheet")).not.toBeNull();

    // First back: closes the top overlay (Menu)
    await act(async () => {
      const handled = backPressHandler ? backPressHandler() : false;
      expect(handled).toBe(true);
    });

    expect(r.queryByText("Option 1")).toBeNull();
    expect(r.queryByText("FullSheet")).not.toBeNull();

    // Second back: closes the FullSheet
    await act(async () => {
      const handled = backPressHandler ? backPressHandler() : false;
      expect(handled).toBe(true);
    });

    expect(r.queryByText("FullSheet")).toBeNull();

    // Third back: no overlays left -> returns false
    let finalHandled = true;
    await act(async () => {
      finalHandled = backPressHandler ? backPressHandler() : true;
    });
    expect(finalHandled).toBe(false);
  });
});

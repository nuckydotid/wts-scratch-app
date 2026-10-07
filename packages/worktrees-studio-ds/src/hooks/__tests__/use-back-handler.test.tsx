import { render, act } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import { useBackHandler } from "../use-back-handler";

describe("useBackHandler", () => {
  let addEventListenerSpy: jest.SpyInstance;
  const mockRemove = jest.fn();

  beforeEach(() => {
    mockRemove.mockClear();
    addEventListenerSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue({ remove: mockRemove } as any);
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  function TestComponent({ handler }: { handler: () => boolean }) {
    useBackHandler(handler);
    return null;
  }

  it("subscribes to hardwareBackPress on mount", async () => {
    const handler = jest.fn(() => true);
    await render(<TestComponent handler={handler} />);

    expect(addEventListenerSpy).toHaveBeenCalledWith("hardwareBackPress", handler);
  });

  it("cleans up subscription on unmount", async () => {
    const handler = jest.fn(() => true);
    const r = await render(<TestComponent handler={handler} />);

    expect(mockRemove).not.toHaveBeenCalled();

    await act(async () => {
      r.unmount();
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("resubscribes when handler changes", async () => {
    const handler1 = jest.fn(() => true);
    const handler2 = jest.fn(() => false);

    const r = await render(<TestComponent handler={handler1} />);

    expect(addEventListenerSpy).toHaveBeenCalledWith("hardwareBackPress", handler1);

    await act(async () => {
      await r.rerender(<TestComponent handler={handler2} />);
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy).toHaveBeenCalledWith("hardwareBackPress", handler2);
  });
});

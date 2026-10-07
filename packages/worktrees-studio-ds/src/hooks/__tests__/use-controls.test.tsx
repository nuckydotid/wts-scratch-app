import { render, act } from "@testing-library/react-native";
import { useControls } from "../use-controls";

describe("useControls", () => {
  const defs = {
    variant: { type: "select" as const, options: ["sm", "md", "lg"] as const, default: "md" },
    isDisabled: { type: "boolean" as const, default: false },
    label: { type: "text" as const, default: "Hello" },
  };

  async function withHook<R>(fn: (ctrl: ReturnType<typeof useControls>) => R) {
    let hookResult: any;
    function Test() {
      hookResult = useControls(defs);
      return null;
    }
    await act(async () => {
      render(<Test />);
    });
    const ret = await act(async () => fn(hookResult!));
    await act(async () => {}); // flush pending state updates
    return { result: hookResult!, ret };
  }

  it("returns default values from defs", async () => {
    const { result } = await withHook(() => {});
    expect(result.props).toEqual({ variant: "md", isDisabled: false, label: "Hello" });
  });

  it("updates a single value via set()", async () => {
    const { result } = await withHook((c) => c.set("variant", "lg"));
    expect(result.props.variant).toBe("lg");
  });

  it("resets all values to defaults via reset()", async () => {
    const { result } = await withHook((c) => {
      c.set("variant", "lg");
      c.set("label", "Clicked");
      c.reset();
    });
    expect(result.props).toEqual({ variant: "md", isDisabled: false, label: "Hello" });
  });

  it("returns defs unchanged", async () => {
    const { result } = await withHook(() => {});
    expect(result.defs).toBe(defs);
  });
});

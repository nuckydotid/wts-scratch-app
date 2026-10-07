import { render, act } from "@testing-library/react-native";
import {
  AppFontProvider,
  ActiveFontProvider,
  useAppFont,
  useActiveFont,
  resolveFontFamily,
  FONT_NAMES,
} from "../use-font";

describe("resolveFontFamily", () => {
  it("resolves poppins normal", () => {
    expect(resolveFontFamily("poppins", undefined, undefined)).toBe("Poppins");
  });
  it("resolves roboto bold", () => {
    expect(resolveFontFamily("roboto", undefined, "bold")).toBe("Roboto-Bold");
  });
  it("resolves jakarta semibold for h2 heading", () => {
    expect(resolveFontFamily("jakarta", "h2", undefined)).toBe("PlusJakartaSans-SemiBold");
  });
  it("resolves nunito medium", () => {
    expect(resolveFontFamily("nunito", undefined, "medium")).toBe("NunitoSans-Medium");
  });
  it("weight overrides heading default", () => {
    expect(resolveFontFamily("poppins", "h1", "normal")).toBe("Poppins");
  });
});

describe("FONT_NAMES", () => {
  it("has 4 fonts", () => {
    expect(FONT_NAMES).toHaveLength(4);
  });
  it("has poppins as first", () => {
    expect(FONT_NAMES[0].key).toBe("poppins");
  });
});

describe("AppFontProvider + useAppFont", () => {
  async function withProvider(fn: (ctrl: ReturnType<typeof useAppFont>) => void) {
    let hookResult: ReturnType<typeof useAppFont> | undefined;
    function Test() {
      hookResult = useAppFont();
      return null;
    }
    await act(async () => {
      render(
        <AppFontProvider>
          <Test />
        </AppFontProvider>
      );
    });
    await act(async () => fn(hookResult!));
    await act(async () => {});
    return hookResult!;
  }

  it("defaults to poppins", async () => {
    const r = await withProvider(() => {});
    expect(r.selectedFont).toBe("poppins");
  });

  it("setSelectedFont changes font", async () => {
    const r = await withProvider((c) => c.setSelectedFont("roboto"));
    expect(r.selectedFont).toBe("roboto");
  });
});

describe("ActiveFontProvider + useActiveFont", () => {
  async function withActiveProvider(fn: (font: string | null) => void) {
    let activeFont: string | null | undefined;
    function Test() {
      activeFont = useActiveFont();
      return null;
    }
    await act(async () => {
      render(
        <AppFontProvider>
          <ActiveFontProvider>
            <Test />
          </ActiveFontProvider>
        </AppFontProvider>
      );
    });
    await act(async () => fn(activeFont!));
    await act(async () => {});
    return activeFont!;
  }

  it("provides font name inside ActiveFontProvider", async () => {
    const f = await withActiveProvider(() => {});
    expect(f).toBe("poppins");
  });
});

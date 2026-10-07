import { render } from "@testing-library/react-native";
import { MonoText } from "../mono-text.component";

describe("MonoText", () => {
  it("renders children text", async () => {
    const { getByText } = await render(<MonoText>monospace text</MonoText>);
    expect(getByText("monospace text")).toBeTruthy();
  });

  it("renders with className", async () => {
    const { getByText } = await render(<MonoText className="text-xs">small</MonoText>);
    expect(getByText("small")).toBeTruthy();
  });
});

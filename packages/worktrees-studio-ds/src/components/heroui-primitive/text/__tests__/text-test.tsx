import { render } from "@testing-library/react-native";
import { UiText } from "../text.component";

describe("UiText", () => {
  it("renders children text", async () => {
    const { getByText } = await render(<UiText>Hello World</UiText>);
    expect(getByText("Hello World")).toBeTruthy();
  });

  it("renders with type prop", async () => {
    const { getByText } = await render(<UiText type="h1">Heading</UiText>);
    expect(getByText("Heading")).toBeTruthy();
  });

  it("renders with weight prop", async () => {
    const { getByText } = await render(<UiText weight="bold">Bold</UiText>);
    expect(getByText("Bold")).toBeTruthy();
  });
});

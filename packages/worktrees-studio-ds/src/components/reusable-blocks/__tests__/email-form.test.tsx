import { render } from "@testing-library/react-native";
import { BlockEmailForm } from "../block-email-form";

describe("BlockEmailForm", () => {
  it("exposes the derived error surface testID while invalid", async () => {
    const { getByTestId } = await render(
      <BlockEmailForm
        email=""
        emailError="Email tidak valid"
        isLoading={false}
        buttonLabel="Kirim Kode"
        emailLabel="Email"
        emailInputTestID="email-input"
        sendButtonTestID="send-code-btn"
      />
    );

    expect(getByTestId("email-input-error")).toBeTruthy();
  });
});

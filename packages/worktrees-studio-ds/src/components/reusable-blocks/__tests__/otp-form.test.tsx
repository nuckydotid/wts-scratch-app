import { render, fireEvent, screen, waitFor, cleanup } from "@testing-library/react-native";
import { BlockOtpForm } from "../block-otp-form";

describe("BlockOtpForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("auto-fires onOtpComplete at 6 digits", async () => {
    const onOtpComplete = jest.fn();
    const onChangeOtp = jest.fn();
    await render(
      <BlockOtpForm
        otpLabel="Enter OTP Code"
        otp=""
        otpError=""
        isLoading={false}
        buttonLabel="Sign In"
        onChangeOtp={onChangeOtp}
        onOtpComplete={onOtpComplete}
        otpInputTestID="otp-input"
      />
    );
    const input = screen.getByTestId("otp-input");
    await fireEvent.changeText(input, "123");
    expect(onChangeOtp).toHaveBeenCalledWith("123");
    expect(onOtpComplete).not.toHaveBeenCalled();
    await fireEvent.changeText(input, "123456");
    expect(onOtpComplete).toHaveBeenCalledWith("123456");
  });

  it("exposes the error surface with its derived testID", async () => {
    await render(
      <BlockOtpForm
        otpLabel="Enter OTP Code"
        otp=""
        otpError="Kode OTP tidak valid"
        isLoading={false}
        buttonLabel="Sign In"
        onChangeOtp={jest.fn()}
        onOtpComplete={jest.fn()}
        otpInputTestID="otp-input"
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId("otp-input-error")).toBeTruthy();
    });
  });
});

import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UiButton } from "../../heroui-primitive";
import { TeleportProvider } from "../../teleport";
import { BlockFormField } from "../block-form-field";

const schema = z.object({ name: z.string().trim().min(1, "Nama wajib diisi") });

function TestForm() {
  const form = useForm<{ name: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });
  return (
    <TeleportProvider>
      <BlockFormField
        control={form.control}
        field={{ name: "name", label: "Nama", testID: "demo-field" }}
      />
      <UiButton testID="demo-submit" onPress={() => form.handleSubmit(() => {})()}>
        Submit
      </UiButton>
    </TeleportProvider>
  );
}

describe("BlockFormField", () => {
  it("renders the derived ${fieldTestID}-error surface only while invalid", async () => {
    const { getByTestId, queryByTestId } = await render(<TestForm />);

    expect(queryByTestId("demo-field-error")).toBeNull();

    await fireEvent.press(getByTestId("demo-submit"));
    await waitFor(() => {
      expect(getByTestId("demo-field-error")).toBeTruthy();
    });

    await fireEvent.changeText(getByTestId("demo-field"), "Ada");
    await waitFor(() => {
      expect(queryByTestId("demo-field-error")).toBeNull();
    });
  });
});

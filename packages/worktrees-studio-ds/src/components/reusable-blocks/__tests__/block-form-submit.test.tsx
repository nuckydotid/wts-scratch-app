import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useForm, useFormState, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text, TextInput, View } from "react-native";
import { TeleportProvider } from "../../teleport";
import { BlockFormSubmit } from "../block-form-submit";

const schema = z.object({
  nis: z.string().min(1, "NIS wajib diisi."),
});

type Values = { nis: string };

/** useFormState subscribes the probe to the form's state subject (the
 * "unreachable submit" trap — reading form.formState directly never
 * re-renders). */
function FieldErrorProbe({ control }: { control: Control<Values> }) {
  const { errors } = useFormState({ control });
  return <Text testID="field-nis">{errors.nis?.message}</Text>;
}

function Harness({ onSubmit }: { onSubmit: (v: Values) => void }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { nis: "" },
  });
  return (
    <TeleportProvider>
      <View>
        <TextInput
          testID="input-nis"
          value={form.watch("nis")}
          onChangeText={(v) => form.setValue("nis", v)}
        />
        <FieldErrorProbe control={form.control} />
        <BlockFormSubmit
          form={form}
          submitLabel="Simpan"
          submitTestID="submit"
          onSubmit={onSubmit}
        />
      </View>
    </TeleportProvider>
  );
}

describe("BlockFormSubmit", () => {
  it("stays enabled for an incomplete form and toasts the specific field error on submit", async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getAllByText } = await render(<Harness onSubmit={onSubmit} />);

    // Never disabled for incomplete forms — validation runs on submit.
    expect(getByTestId("submit").props.accessibilityState?.disabled).toBeFalsy();

    // RNTL v14 fireEvent is async — awaited so its act() closes before the
    // next act() starts (overlapping acts corrupt the following render).
    await fireEvent.press(getByTestId("submit"));

    // The specific field message renders under the field AND toasts (no
    // generic wording), and the handler is not called.
    await waitFor(() => expect(getAllByText("NIS wajib diisi.").length).toBeGreaterThanOrEqual(1));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit for a valid form", async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = await render(<Harness onSubmit={onSubmit} />);

    await fireEvent.changeText(getByTestId("input-nis"), "20250001");
    await fireEvent.press(getByTestId("submit"));

    await waitFor(() => expect(onSubmit.mock.calls[0]?.[0]).toEqual({ nis: "20250001" }));
  });

  it("shows the spinner while the submit promise is pending", async () => {
    // Deferred promise — mirrors the storyboard "submitting" cases. The press
    // act() parks on the deferred submit; resolving it resumes and closes
    // that same act(), so nothing async leaks into later tests.
    let resolveSubmit: (v: Values) => void = () => {};
    const onSubmit = jest.fn(() => new Promise<Values>((resolve) => (resolveSubmit = resolve)));
    const { getByTestId } = await render(<Harness onSubmit={onSubmit} />);

    await fireEvent.changeText(getByTestId("input-nis"), "20250001");

    // Async fireEvent intentionally captured: the parked act is resumed by
    // resolveSubmit and awaited through pressPromise below.
    const pressPromise = fireEvent.press(getByTestId("submit")); // async-event-ok: awaited after resolveSubmit
    // Flush zod's async validation and the isSubmitting=true render inside
    // the parked act(), then observe the spinner before resuming it.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(getByTestId("submit-spinner")).toBeTruthy();
    resolveSubmit({ nis: "20250001" });
    await pressPromise;
  });
});

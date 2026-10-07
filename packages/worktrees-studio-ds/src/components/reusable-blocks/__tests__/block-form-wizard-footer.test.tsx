import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useState } from "react";
import { Text, TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FullSheetContext, TeleportProvider, useFullSheet } from "../../teleport";
import { BlockFormWizardFooter } from "../block-form-wizard-footer";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi."),
});

type Values = { title: string };

const STEP_FIELDS = [["title"], [], []];

const closeSpy = jest.fn();

function StepProbe() {
  const { data } = useFullSheet<{ activeStep?: number }>();
  return <Text testID="step-probe">{JSON.stringify(data)}</Text>;
}

function Harness({ onSubmit }: { onSubmit: (v: Values) => void }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });
  const [data, setData] = useState<{ activeStep?: number }>({ activeStep: 0 });
  return (
    <TeleportProvider>
      <FullSheetContext.Provider
        value={{
          data,
          setData: (next: unknown) => setData(next as { activeStep?: number }),
          close: closeSpy,
        }}
      >
        <StepProbe />
        <TextInput
          testID="input-title"
          defaultValue=""
          onChangeText={(v) => form.setValue("title", v)}
        />
        <BlockFormWizardFooter
          form={form}
          stepFields={STEP_FIELDS}
          nextLabel="Lanjut"
          backLabel="Kembali"
          cancelLabel="Batal"
          submitLabel="Terbitkan"
          submitTestID="submit"
          nextTestID="next"
          backTestID="back"
          cancelTestID="cancel"
          onSubmit={onSubmit}
        />
      </FullSheetContext.Provider>
    </TeleportProvider>
  );
}

describe("BlockFormWizardFooter", () => {
  beforeEach(() => {
    closeSpy.mockClear();
  });

  it("renders Cancel beside Next on the first step", async () => {
    const { getByTestId, queryByTestId } = await render(<Harness onSubmit={jest.fn()} />);
    expect(getByTestId("next")).toBeTruthy();
    expect(getByTestId("cancel")).toBeTruthy();
    expect(queryByTestId("back")).toBeNull();
  });

  it("Cancel closes the sheet on the first step", async () => {
    const { getByTestId } = await render(<Harness onSubmit={jest.fn()} />);
    await fireEvent.press(getByTestId("cancel"));
    // The close callback is invoked through the FullSheetContext close.
    expect(closeSpy).toHaveBeenCalled();
  });

  it("validates the step fields on Next and does not advance when invalid", async () => {
    const { getByTestId, getAllByText, getByText } = await render(<Harness onSubmit={jest.fn()} />);
    await fireEvent.press(getByTestId("next"));
    // The specific field error toasts (TeleportProvider) and the step stays.
    await waitFor(() => expect(getAllByText("Judul wajib diisi.").length).toBeGreaterThan(0));
    expect(getByText('{"activeStep":0}')).toBeTruthy();
  });

  it("advances when the step fields validate and shows Back on the next step", async () => {
    const { getByTestId, getByText } = await render(<Harness onSubmit={jest.fn()} />);
    await fireEvent.changeText(getByTestId("input-title"), "Lomba Mewarnai");
    await fireEvent.press(getByTestId("next"));
    await waitFor(() => expect(getByText('{"activeStep":1}')).toBeTruthy());
    expect(getByTestId("back")).toBeTruthy();
  });

  it("Back returns a step and the last step swaps Next for Submit", async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await render(<Harness onSubmit={onSubmit} />);
    await fireEvent.changeText(getByTestId("input-title"), "Lomba Mewarnai");
    // Step 1 → step 2 (no fields to validate) → Back → step 1 → Back → step 0.
    await fireEvent.press(getByTestId("next"));
    await waitFor(() => expect(getByText('{"activeStep":1}')).toBeTruthy());
    await fireEvent.press(getByTestId("next"));
    await waitFor(() => expect(getByText('{"activeStep":2}')).toBeTruthy());
    expect(getByTestId("back")).toBeTruthy();
    expect(queryByTestId("next")).toBeNull();
    expect(getByTestId("submit")).toBeTruthy();
    expect(getByText("Terbitkan")).toBeTruthy();

    await fireEvent.press(getByTestId("back"));
    await waitFor(() => expect(getByText('{"activeStep":1}')).toBeTruthy());
    await fireEvent.press(getByTestId("back"));
    await waitFor(() => expect(getByText('{"activeStep":0}')).toBeTruthy());
    expect(queryByTestId("back")).toBeNull();
  });

  it("submits via handleSubmit on the last step", async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = await render(<Harness onSubmit={onSubmit} />);
    await fireEvent.changeText(getByTestId("input-title"), "Lomba Mewarnai");
    await fireEvent.press(getByTestId("next"));
    await waitFor(() => expect(getByText('{"activeStep":1}')).toBeTruthy());
    await fireEvent.press(getByTestId("next"));
    await waitFor(() => expect(getByText('{"activeStep":2}')).toBeTruthy());
    await fireEvent.press(getByTestId("submit"));
    await waitFor(() => expect(onSubmit.mock.calls[0][0]).toEqual({ title: "Lomba Mewarnai" }));
  });
});

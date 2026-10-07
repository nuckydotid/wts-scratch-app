import { render } from "@testing-library/react-native";

import { BlockIdCard } from "../block-id-card";

const BASE = {
  name: "Aisyah Putri",
  photoUrl: "https://example.com/photo.png",
  rows: [
    { label: "Name", value: "Aisyah Putri" },
    { label: "NIS", value: "20250001" },
    { label: "Birth", value: "Ciamis, 14 August 2020" },
  ],
  retryLabel: "Try again",
  retryTitle: "Couldn't load",
  headerLines: ["RAUDHATUL ATHFAL", "MIFTAHUL FALAH"],
  qrValue: "https://example.com/id-card?token=abc",
  seed: "20250001",
};

const RETRY = { retryLabel: "Try again", retryTitle: "Couldn't load" };

describe("BlockIdCard", () => {
  it("renders the card identity rows, header lines and QR", async () => {
    const { getByText } = await render(<BlockIdCard {...RETRY} {...BASE} />);
    expect(getByText("Aisyah Putri")).toBeTruthy();
    expect(getByText("NIS")).toBeTruthy();
    expect(getByText("20250001")).toBeTruthy();
    expect(getByText("Ciamis, 14 August 2020")).toBeTruthy();
    expect(getByText("RAUDHATUL ATHFAL")).toBeTruthy();
    expect(getByText("MIFTAHUL FALAH")).toBeTruthy();
  });

  it("renders the initials placeholder when no photo", async () => {
    const { getByText } = await render(<BlockIdCard {...BASE} photoUrl={null} />);
    expect(getByText("A")).toBeTruthy();
  });

  it("renders the card-shaped skeleton while loading", async () => {
    const { toJSON } = await render(<BlockIdCard {...BASE} isLoading />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders the retry state on error", async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<BlockIdCard {...BASE} isError onRetry={onRetry} />);
    expect(getByText("Try again")).toBeTruthy();
  });
});

import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { BlockSearchableSelectSheet } from "../block-searchable-select-sheet";

/* eslint-disable react/display-name, react-hooks/rules-of-hooks */
jest.mock("heroui-native/search-field", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput } = require("react-native");
  const SearchFieldContext = React.createContext(null);
  const Root = ({ value, onChange, children }: any) => (
    <SearchFieldContext.Provider value={{ value, onChange }}>
      {children}
    </SearchFieldContext.Provider>
  );
  Root.Group = ({ children }: any) => children;
  Root.SearchIcon = () => null;
  Root.Input = ({ testID, placeholder }: any) => {
    const ctx = React.useContext(SearchFieldContext);
    return (
      <TextInput
        testID={testID}
        placeholder={placeholder}
        value={ctx.value}
        onChangeText={ctx.onChange}
      />
    );
  };
  Root.ClearButton = () => null;
  return { SearchField: Root, default: Root };
});

const SECTIONS = [
  {
    title: "August - 2025",
    data: [
      { id: "s1", label: "Aisyah Putri", subtitle: "20250001" },
      { id: "s2", label: "Zahra Ramadhani", subtitle: "20250002" },
    ],
  },
];

const RETRY = { retryLabel: "Retry", retryTitle: "Couldn't load", emptyLabel: "No results" };

describe("BlockSearchableSelectSheet", () => {
  it("renders the title, search placeholder, section headers and rows", async () => {
    const { getByText, getByPlaceholderText } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Students"
        searchPlaceholder="Search students by name"
        checkedIds={new Set(["s1"])}
        sections={SECTIONS}
        onSearchChange={() => {}}
        onToggle={() => {}}
        onLoadMore={() => {}}
      />
    );
    expect(getByText("Add Students")).toBeTruthy();
    expect(getByPlaceholderText("Search students by name")).toBeTruthy();
    expect(getByText("August - 2025")).toBeTruthy();
    expect(getByText("Aisyah Putri")).toBeTruthy();
    expect(getByText("Zahra Ramadhani")).toBeTruthy();
  });

  it("reports row toggles for the host's checked set", async () => {
    const onToggle = jest.fn();
    const { getByTestId } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Students"
        searchPlaceholder="Search"
        checkedIds={new Set(["s1"])}
        sections={SECTIONS}
        onSearchChange={() => {}}
        onToggle={onToggle}
        onLoadMore={() => {}}
      />
    );

    // Checked rows carry the `-checked` testID suffix (E2E visibility).
    await fireEvent.press(getByTestId("searchable-row-s1-checked"));
    expect(onToggle).toHaveBeenCalledWith("s1");

    await fireEvent.press(getByTestId("searchable-row-s2"));
    expect(onToggle).toHaveBeenCalledWith("s2");
  });

  it("fires the debounced search 700ms after the query stops changing", async () => {
    jest.useFakeTimers();
    const onSearchChange = jest.fn();
    const { getByTestId } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Students"
        searchPlaceholder="Search"
        checkedIds={new Set()}
        sections={SECTIONS}
        searchTestID="search-input"
        onSearchChange={onSearchChange}
        onToggle={() => {}}
        onLoadMore={() => {}}
      />
    );
    await fireEvent.changeText(getByTestId("search-input"), "ais");

    expect(onSearchChange).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(699);
    });
    expect(onSearchChange).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(onSearchChange).toHaveBeenCalledWith("ais");
    jest.useRealTimers();
  });

  it("fires onLoadMore on end reached when more pages exist", async () => {
    const onLoadMore = jest.fn();
    const { getByTestId } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Teachers"
        searchPlaceholder="Search"
        checkedIds={new Set()}
        items={[{ id: "t1", label: "Siti Aminah" }]}
        hasMore
        listTestID="searchable-list"
        onSearchChange={() => {}}
        onToggle={() => {}}
        onLoadMore={onLoadMore}
      />
    );
    await fireEvent(getByTestId("searchable-list"), "onEndReached");
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not fire onLoadMore when hasMore is false", async () => {
    const onLoadMore = jest.fn();
    const { getByTestId } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Teachers"
        searchPlaceholder="Search"
        checkedIds={new Set()}
        items={[{ id: "t1", label: "Siti Aminah" }]}
        hasMore={false}
        listTestID="searchable-list"
        onSearchChange={() => {}}
        onToggle={() => {}}
        onLoadMore={onLoadMore}
      />
    );
    await fireEvent(getByTestId("searchable-list"), "onEndReached");
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("shows the empty label when there are no rows", async () => {
    const { getByText } = await render(
      <BlockSearchableSelectSheet
        {...RETRY}
        {...RETRY}
        title="Add Students"
        searchPlaceholder="Search"
        checkedIds={new Set()}
        sections={[{ title: "August - 2025", data: [] }]}
        emptyLabel="No results"
        onSearchChange={() => {}}
        onToggle={() => {}}
        onLoadMore={() => {}}
      />
    );
    await waitFor(() => expect(getByText("No results")).toBeTruthy());
  });
});

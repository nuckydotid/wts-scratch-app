import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { TemplateSearchableSectionListScreen } from "../template-searchable-section-list-screen";
import { UiText, UiView } from "../../heroui-primitive";

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
      { id: "s1", label: "Aisyah Putri" },
      { id: "s2", label: "Zahra Ramadhani" },
    ],
  },
];

function Row({ item }: { item: { id: string; label: string } }) {
  return (
    <UiView>
      <UiText>{item.label}</UiText>
    </UiView>
  );
}

function renderTemplate(overrides: Record<string, unknown> = {}) {
  return render(
    <TemplateSearchableSectionListScreen<{ id: string; label: string }>
      {...RETRY}
      searchPlaceholder="Search students by name"
      sections={SECTIONS}
      onSearchChange={() => {}}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Row item={item} />}
      {...overrides}
    />
  );
}

const RETRY = { retryLabel: "Try again", retryTitle: "Couldn't load", emptyLabel: "No results" };

describe("TemplateSearchableSectionListScreen", () => {
  it("renders the search placeholder, section headers and rows", async () => {
    const { getByText, getByPlaceholderText } = await renderTemplate();
    expect(getByPlaceholderText("Search students by name")).toBeTruthy();
    expect(getByText("August - 2025")).toBeTruthy();
    expect(getByText("Aisyah Putri")).toBeTruthy();
    expect(getByText("Zahra Ramadhani")).toBeTruthy();
  });

  it("renders flat items as a single section", async () => {
    const { getByText } = await renderTemplate({
      sections: undefined,
      items: [{ id: "t1", label: "Siti Aminah" }],
    });
    expect(getByText("Siti Aminah")).toBeTruthy();
  });

  it("passes isFirst/isLast per section for grouped rounding", async () => {
    const seen: { isFirst: boolean; isLast: boolean }[] = [];
    await render(
      <TemplateSearchableSectionListScreen<{ id: string; label: string }>
        {...RETRY}
        searchPlaceholder="Search"
        sections={SECTIONS}
        onSearchChange={() => {}}
        keyExtractor={(item) => item.id}
        renderItem={({ item, isFirst, isLast }) => {
          seen.push({ isFirst, isLast });
          return <Row item={item} />;
        }}
      />
    );
    expect(seen).toEqual([
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: true },
    ]);
  });

  it("fires the debounced search 700ms after the query stops changing", async () => {
    jest.useFakeTimers();
    const onSearchChange = jest.fn();
    const { getByTestId } = await renderTemplate({
      searchTestID: "search-input",
      onSearchChange,
    });
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

  it("fires onEndReached when more pages exist", async () => {
    const onEndReached = jest.fn();
    const { getByTestId } = await renderTemplate({
      items: [{ id: "t1", label: "Siti Aminah" }],
      sections: undefined,
      hasMore: true,
      listTestID: "searchable-list",
      onEndReached,
    });
    await fireEvent(getByTestId("searchable-list"), "onEndReached");
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it("does not fire onEndReached when hasMore is false", async () => {
    const onEndReached = jest.fn();
    const { getByTestId } = await renderTemplate({
      items: [{ id: "t1", label: "Siti Aminah" }],
      sections: undefined,
      hasMore: false,
      listTestID: "searchable-list",
      onEndReached,
    });
    await fireEvent(getByTestId("searchable-list"), "onEndReached");
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it("shows the empty label when there are no rows", async () => {
    const { getByText } = await renderTemplate({
      sections: [{ title: "August - 2025", data: [] }],
      emptyLabel: "No students",
    });
    await waitFor(() => expect(getByText("No students")).toBeTruthy());
  });

  it("shows skeleton rows while loading", async () => {
    const { getByTestId } = await renderTemplate({
      isLoading: true,
      loadingTestID: "searchable-loading",
    });
    expect(getByTestId("searchable-loading")).toBeTruthy();
  });

  it("shows skeleton rows on error", async () => {
    const { getByTestId } = await renderTemplate({
      isError: true,
      loadingTestID: "searchable-loading",
    });
    expect(getByTestId("searchable-loading")).toBeTruthy();
  });

  it("renders the header and footer slots", async () => {
    const { getByText } = await renderTemplate({
      header: <UiText>Header slot</UiText>,
      footer: <UiText>Footer slot</UiText>,
    });
    expect(getByText("Header slot")).toBeTruthy();
    expect(getByText("Footer slot")).toBeTruthy();
  });
});

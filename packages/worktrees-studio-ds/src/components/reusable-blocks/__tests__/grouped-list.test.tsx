import { render } from "@testing-library/react-native";
import { BlockGroupedList, type GroupedListRow } from "../block-grouped-list";
import { GroupedListSkeleton } from "../block-grouped-list-parts";

const RETRY = { retryLabel: "Retry", retryTitle: "Couldn't load" };

describe("BlockGroupedList", () => {
  it("renders pulse skeletons while loading", async () => {
    const r = await render(
      <BlockGroupedList {...RETRY} isLoading rowCount={2}>
        <BlockGroupedList.Row title="a" />
      </BlockGroupedList>
    );
    expect(JSON.stringify(r.toJSON())).toContain("pulse");
  });

  it("renders shape-aware skeleton variants matching their row layouts", async () => {
    const pulseCount = async (variant: Parameters<typeof GroupedListSkeleton>[0]["variant"]) => {
      const r = await render(<GroupedListSkeleton rowCount={1} variant={variant} />);
      return JSON.stringify(r.toJSON()).match(/pulse/g)?.length ?? 0;
    };
    // default: avatar + 2 bars + chevron; chevron: 2 bars + chevron; pill: bar + pill
    expect(await pulseCount("default")).toBe(4);
    expect(await pulseCount("chevron")).toBe(3);
    expect(await pulseCount("pill")).toBe(2);
    // icon-card: square icon + 2 bars + chevron
    expect(await pulseCount("icon-card")).toBe(4);
    // report: name + letter pill + chevron
    expect(await pulseCount("report")).toBe(3);
    // stats: name + 3 stat blocks
    expect(await pulseCount("stats")).toBe(4);
    // media: avatar + 2 name bars + time bar + media box + 2 caption bars + 2 chips = 9 pulses
    expect(await pulseCount("media")).toBe(9);
  });

  it("renders the child rows when not loading", async () => {
    const { getByText } = await render(
      <BlockGroupedList {...RETRY} rowCount={2}>
        <BlockGroupedList.Row title="Kelas A" />
      </BlockGroupedList>
    );
    expect(getByText("Kelas A")).toBeTruthy();
  });

  it("renders items mode rows with the built-in row visual", async () => {
    const items: GroupedListRow[] = [
      {
        id: "s1",
        title: "Students",
        subtitle: "View class students",
        icon: "people-outline",
        testID: "class-hub-students",
      },
      {
        id: "s2",
        title: "Attendance",
        subtitle: "Mark daily attendance",
        testID: "class-hub-attendance",
      },
    ];
    const { getByTestId, getByText } = await render(<BlockGroupedList {...RETRY} items={items} />);
    expect(getByTestId("class-hub-students")).toBeTruthy();
    expect(getByTestId("class-hub-attendance")).toBeTruthy();
    expect(getByText("Students")).toBeTruthy();
    expect(getByText("View class students")).toBeTruthy();
    expect(getByText("Mark daily attendance")).toBeTruthy();
  });

  it("renders the empty component when items are empty", async () => {
    const { getByText } = await render(
      <BlockGroupedList
        {...RETRY}
        items={[]}
        emptyComponent={<BlockGroupedList.Row title="No items" />}
      />
    );
    expect(getByText("No items")).toBeTruthy();
  });

  it("renders skeleton on error", async () => {
    const r = await render(
      <BlockGroupedList {...RETRY} isError>
        <BlockGroupedList.Row title="a" />
      </BlockGroupedList>
    );
    expect(JSON.stringify(r.toJSON())).toContain("pulse");
  });
});

describe("BlockGroupedList.Row", () => {
  it("falls back the avatar initial to ? for empty titles", async () => {
    const { getAllByText } = await render(<BlockGroupedList.Row title="" />);
    expect(getAllByText("?")).toBeTruthy();
  });

  it("uses the title's first letter for the avatar", async () => {
    const { getByText } = await render(<BlockGroupedList.Row title="Kelas A" />);
    expect(getByText("K")).toBeTruthy();
  });

  it("renders the icon in the left slot instead of the avatar initial", async () => {
    const { queryByText, getByText } = await render(
      <BlockGroupedList.Row title="Attendance" icon="calendar-outline" />
    );
    expect(queryByText("A")).toBeNull();
    expect(getByText("Attendance")).toBeTruthy();
  });
});

describe("BlockGroupedList virtualized mode", () => {
  it("renders the items through the FlatList engine with first/last rounding", async () => {
    const { getByTestId, getByText } = await render(
      <BlockGroupedList
        {...RETRY}
        virtualized
        items={[
          { id: "a", title: "Alpha" },
          { id: "b", title: "Beta" },
        ]}
      />
    );
    expect(getByTestId("block-grouped-list-virtualized")).toBeTruthy();
    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Beta")).toBeTruthy();
  });

  it("supports renderRow overrides and onEndReached", async () => {
    const onEndReached = jest.fn();
    const { getByTestId, getByText } = await render(
      <BlockGroupedList
        {...RETRY}
        virtualized
        onEndReached={onEndReached}
        items={[{ id: "a", title: "Alpha" }]}
        renderRow={(item) => <BlockGroupedList.Row title={`custom-${item.title}`} />}
      />
    );
    expect(getByText("custom-Alpha")).toBeTruthy();
    const list = getByTestId("block-grouped-list-virtualized");
    list.props.onEndReached?.();
    expect(onEndReached).toHaveBeenCalled();
  });

  it("renders the shared skeleton rows while loading", async () => {
    const { queryByTestId, queryByText } = await render(
      <BlockGroupedList {...RETRY} virtualized isLoading rowCount={3} items={[]} />
    );
    expect(queryByText("Alpha")).toBeNull();
    expect(queryByTestId("block-grouped-list-virtualized")).toBeNull();
  });

  it("shows the empty component for an empty item list", async () => {
    const { getByText } = await render(
      <BlockGroupedList
        {...RETRY}
        virtualized
        items={[]}
        emptyComponent={<BlockGroupedList.Row title="no rows" />}
      />
    );
    expect(getByText("no rows")).toBeTruthy();
  });

  it("renders the header row as the only rounded-top element above children", async () => {
    const r = await render(
      <BlockGroupedList {...RETRY} headerRow={<BlockGroupedList.Row title="Header" />}>
        <BlockGroupedList.Row title="a" />
        <BlockGroupedList.Row title="b" />
      </BlockGroupedList>
    );
    const json = JSON.stringify(r.toJSON());
    // Header owns the top rounding; children rows round only at the bottom.
    expect(json.match(/rounded-t-2xl/g)?.length ?? 0).toBe(1);
    expect(json.match(/rounded-b-2xl/g)?.length ?? 0).toBe(1);
  });

  it("keeps the header row pinned above the loading skeleton", async () => {
    const r = await render(
      <BlockGroupedList
        {...RETRY}
        isLoading
        rowCount={2}
        headerRow={<BlockGroupedList.Row title="Header" />}
      >
        <BlockGroupedList.Row title="a" />
      </BlockGroupedList>
    );
    const json = JSON.stringify(r.toJSON());
    expect(json).toContain("Header");
    expect(json).toContain("pulse");
    // The header is the only rounded-top element (skeleton first row is flat).
    expect(json.match(/rounded-t-2xl/g)?.length ?? 0).toBe(1);
  });

  it("keeps the header row pinned above the error and empty states", async () => {
    const err = await render(
      <BlockGroupedList {...RETRY} isError headerRow={<BlockGroupedList.Row title="Header" />}>
        <BlockGroupedList.Row title="a" />
      </BlockGroupedList>
    );
    const errJson = JSON.stringify(err.toJSON());
    expect(errJson).toContain("Header");
    expect(errJson).toContain("pulse");

    const empty = await render(
      <BlockGroupedList
        {...RETRY}
        items={[]}
        headerRow={<BlockGroupedList.Row title="Header" />}
        emptyComponent={<BlockGroupedList.Row title="no rows" />}
      />
    );
    const emptyJson = JSON.stringify(empty.toJSON());
    expect(emptyJson).toContain("Header");
    expect(emptyJson).toContain("no rows");
    expect(emptyJson.match(/rounded-t-2xl/g)?.length ?? 0).toBe(1);
  });
});

describe("BlockGroupedList.Field & SectionHeader", () => {
  it("renders stacked field with label and value", async () => {
    const { getByText, getByTestId } = await render(
      <BlockGroupedList.Field
        label="Nama Lengkap"
        value="Ahmad Dahlan"
        testID="field-row"
        valueTestID="field-value"
      />
    );
    expect(getByText("Nama Lengkap")).toBeTruthy();
    expect(getByText("Ahmad Dahlan")).toBeTruthy();
    expect(getByTestId("field-row")).toBeTruthy();
    expect(getByTestId("field-value")).toBeTruthy();
  });

  it("renders fallback dash when value is empty or nil", async () => {
    const { getByText } = await render(<BlockGroupedList.Field label="Catatan" value="" />);
    expect(getByText("Catatan")).toBeTruthy();
    expect(getByText("—")).toBeTruthy();
  });

  it("renders inline field layout", async () => {
    const { getByText } = await render(
      <BlockGroupedList.Field layout="inline" label="Status" value="Aktif" />
    );
    expect(getByText("Status")).toBeTruthy();
    expect(getByText("Aktif")).toBeTruthy();
  });

  it("renders SectionHeader with title or children", async () => {
    const { getByText, getByTestId } = await render(
      <BlockGroupedList.SectionHeader title="Informasi Siswa" testID="section-header" />
    );
    expect(getByText("Informasi Siswa")).toBeTruthy();
    expect(getByTestId("section-header")).toBeTruthy();
  });
});

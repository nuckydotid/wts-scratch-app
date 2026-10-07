import { act, fireEvent, render } from "@testing-library/react-native";
import {
  BlockAttachmentEditor,
  type AnnouncementDraftAttachment,
  type BlockAttachmentEditorTexts,
} from "../block-attachment-editor";

const TEXTS: BlockAttachmentEditorTexts = {
  label: "Attachments",
  filesLabel: "Files",
  linksLabel: "Links",
  filesEmpty: "No files attached yet.",
  linksEmpty: "No links added yet.",
  addFile: "Add File",
  addLink: "Add Link",
};

const FILES: AnnouncementDraftAttachment[] = [
  {
    kind: "file",
    url: "https://cdn.example.com/rpp.pdf",
    filename: "rpp.pdf",
    contentType: "application/pdf",
    sizeBytes: 2048,
  },
  { kind: "link", url: "https://example.com/surat", label: "Surat izin" },
];

describe("BlockAttachmentEditor", () => {
  it("renders the Files and Links group headers with plus buttons and their rows", async () => {
    const { getByTestId, getByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={FILES}
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
      />
    );
    expect(getByText("Attachments")).toBeTruthy();
    expect(getByText("Files")).toBeTruthy();
    expect(getByText("Links")).toBeTruthy();
    expect(getByTestId("announcement-attachment-add-file")).toBeTruthy();
    expect(getByTestId("announcement-attachment-add-link")).toBeTruthy();
    // The file draft renders under Files, the link draft under Links.
    expect(getByTestId("announcement-attachment-file-row-0")).toBeTruthy();
    expect(getByText("rpp.pdf")).toBeTruthy();
    expect(getByTestId("announcement-attachment-link-row-0")).toBeTruthy();
    expect(getByText("Surat izin")).toBeTruthy();
  });

  it("renders the empty state for both groups when no drafts exist", async () => {
    const { getByTestId, getByText, queryByTestId } = await render(
      <BlockAttachmentEditor texts={TEXTS} onPickFiles={jest.fn()} onRequestAddLink={jest.fn()} />
    );
    expect(getByTestId("announcement-attachment-files-empty")).toBeTruthy();
    expect(getByText("No files attached yet.")).toBeTruthy();
    expect(getByTestId("announcement-attachment-links-empty")).toBeTruthy();
    expect(getByText("No links added yet.")).toBeTruthy();
    expect(queryByTestId("announcement-attachment-file-row-0")).toBeNull();
    expect(queryByTestId("announcement-attachment-link-row-0")).toBeNull();
  });

  it("shows an empty state only for the group without drafts", async () => {
    const { getByTestId, queryByTestId, getByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={[FILES[1]]}
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
      />
    );
    expect(getByTestId("announcement-attachment-files-empty")).toBeTruthy();
    expect(getByText("No files attached yet.")).toBeTruthy();
    expect(getByTestId("announcement-attachment-link-row-0")).toBeTruthy();
    expect(queryByTestId("announcement-attachment-links-empty")).toBeNull();
  });

  it("appends picked files into the Files group and reports changes", async () => {
    const onAttachmentsChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        onPickFiles={async () => [FILES[0]]}
        onRequestAddLink={jest.fn()}
        onAttachmentsChange={onAttachmentsChange}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-add-file"));
    expect(getByText("rpp.pdf")).toBeTruthy();
    expect(getByTestId("announcement-attachment-file-row-0")).toBeTruthy();
    expect(onAttachmentsChange).toHaveBeenLastCalledWith([FILES[0]]);
  });

  it("keeps drafts when the picker is cancelled", async () => {
    const { getByTestId, queryByTestId } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={[FILES[1]]}
        onPickFiles={async () => []}
        onRequestAddLink={jest.fn()}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-add-file"));
    // The cancelled pick changes nothing — the pre-existing link draft stays.
    expect(queryByTestId("announcement-attachment-file-row-0")).toBeNull();
    expect(getByTestId("announcement-attachment-link-row-0")).toBeTruthy();
  });

  it("surfaces pick/upload failures through onError", async () => {
    const onError = jest.fn();
    const { getByTestId } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        onPickFiles={async () => {
          throw new Error("upload failed");
        }}
        onRequestAddLink={jest.fn()}
        onError={onError}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-add-file"));
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("opens the link sheet through onRequestAddLink and appends the saved link", async () => {
    let appendLink: ((link: AnnouncementDraftAttachment) => void) | null = null;
    const { getByTestId, getByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        onPickFiles={jest.fn()}
        onRequestAddLink={(append) => {
          appendLink = append;
        }}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-add-link"));
    expect(appendLink).toBeDefined();
    await act(async () => {
      appendLink!(FILES[1]);
    });
    expect(getByText("Surat izin")).toBeTruthy();
    expect(getByTestId("announcement-attachment-link-row-0")).toBeTruthy();
  });

  it("removes a file row from its group and reports the change", async () => {
    const onAttachmentsChange = jest.fn();
    const { getByTestId, queryByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={FILES}
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
        onAttachmentsChange={onAttachmentsChange}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-file-remove-0"));
    expect(queryByText("rpp.pdf")).toBeNull();
    expect(onAttachmentsChange).toHaveBeenLastCalledWith([FILES[1]]);
  });

  it("removes a link row from its group and reports the change", async () => {
    const onAttachmentsChange = jest.fn();
    const { getByTestId, queryByText } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={FILES}
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
        onAttachmentsChange={onAttachmentsChange}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-link-remove-0"));
    expect(queryByText("Surat izin")).toBeNull();
    expect(onAttachmentsChange).toHaveBeenLastCalledWith([FILES[0]]);
  });

  it("disables the plus buttons while busy", async () => {
    const { getByTestId } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        busy
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
      />
    );
    expect(getByTestId("announcement-attachment-add-file").props.accessibilityState?.disabled).toBe(
      true
    );
    expect(getByTestId("announcement-attachment-add-link").props.accessibilityState?.disabled).toBe(
      true
    );
  });

  it("fires onPressDraft with the tapped draft via the row label/icon", async () => {
    const onPressDraft = jest.fn();
    const { getByTestId } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        initialAttachments={FILES}
        onPickFiles={jest.fn()}
        onRequestAddLink={jest.fn()}
        onPressDraft={onPressDraft}
      />
    );
    await fireEvent.press(getByTestId("announcement-attachment-file-open-0"));
    expect(onPressDraft).toHaveBeenCalledWith(FILES[0]);
    await fireEvent.press(getByTestId("announcement-attachment-link-open-0"));
    expect(onPressDraft).toHaveBeenLastCalledWith(FILES[1]);
  });

  it("read-only hides the plus buttons and delete icons but keeps rows pressable", async () => {
    const onPressDraft = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <BlockAttachmentEditor
        texts={TEXTS}
        readOnly
        initialAttachments={FILES}
        onPressDraft={onPressDraft}
      />
    );
    expect(queryByTestId("announcement-attachment-add-file")).toBeNull();
    expect(queryByTestId("announcement-attachment-add-link")).toBeNull();
    expect(queryByTestId("announcement-attachment-file-remove-0")).toBeNull();
    expect(queryByTestId("announcement-attachment-link-remove-0")).toBeNull();
    expect(getByTestId("announcement-attachment-file-row-0")).toBeTruthy();
    expect(getByTestId("announcement-attachment-link-row-0")).toBeTruthy();
    await fireEvent.press(getByTestId("announcement-attachment-file-open-0"));
    expect(onPressDraft).toHaveBeenCalledWith(FILES[0]);
  });
});

/**
 * BlockAttachmentEditor — announcement attachment drafts editor (file/link).
 *
 * Step 2 of the announcement wizard renders TWO grouped lists (BlockGroupedList
 * children mode + headerRow):
 *
 *   Files  — header row (centered label flex-1 + plus button) + file-draft
 *            rows (label left flex-1 + delete icon right)
 *   Links  — same shape, link drafts
 *
 * The Files plus runs the host-injected pick+upload flow; the Links plus opens
 * the host's link sheet. Rows are compact: no avatar/icon, label left, red
 * delete icon right.
 *
 * WHY STATE IS INTERNAL: full-sheet content is captured as a frozen React
 * element when `showFullSheet` is called — host state changes never reach an
 * open sheet (see BlockPhotoField). The editor therefore OWNS its drafts
 * inside the sheet, initialized from `initialAttachments`, and mirrors every
 * change through `onAttachmentsChange` so the host can sync it into its form
 * values (read at submit time). Side-effect flows (pick+upload, the link
 * form sheet) are host-injected: the DS has no document picker, API client,
 * or app overlay store.
 */
import { testIds } from "@repo/worktrees-studio-shared-ids";
import { useState } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { BlockGroupedList } from "./block-grouped-list";
import { UiLabel, UiPressable, UiText, UiView, UiIcon } from "../heroui-primitive";

export type AnnouncementDraftAttachment =
  | {
      kind: "file";
      url: string;
      filename: string;
      contentType?: string;
      sizeBytes?: number;
    }
  | {
      kind: "link";
      url: string;
      label?: string;
    };

export type BlockAttachmentEditorTexts = {
  /** Section heading above the two grouped lists. */
  label: string;
  /** Group header labels. */
  filesLabel: string;
  linksLabel: string;
  /** Empty-group rows (muted, centered). */
  filesEmpty: string;
  linksEmpty: string;
  /** Accessibility labels for the header plus buttons. */
  addFile: string;
  addLink: string;
};

type Props = {
  /** Drafts to prefill (edit flow — the sheet content is captured at open
   * time, so pass the post's existing attachments here). */
  initialAttachments?: AnnouncementDraftAttachment[];
  texts: BlockAttachmentEditorTexts;
  /** Disables the add buttons (e.g. while the sheet submits). */
  busy?: boolean;
  /** Read-only mode (e.g. the detail screen): hides the plus buttons and the
   * delete icons; rows stay pressable via `onPressDraft`. */
  readOnly?: boolean;
  /** testID prefix for every interactive element (default
   * "announcement-attachment"). The detail screen passes a distinct prefix so
   * its read-only rows don't collide with the form editor's when both are
   * mounted at once (the edit sheet opens over the detail). */
  testIDPrefix?: string;
  /** Host-injected file flow — pick + upload; resolves with the drafts to
   * append (empty array when the user cancels). Required unless readOnly. */
  onPickFiles?: () => Promise<AnnouncementDraftAttachment[]>;
  /** Host opens its link sheet; `append` commits the saved link draft.
   * Required unless readOnly. */
  onRequestAddLink?: (append: (link: AnnouncementDraftAttachment) => void) => void;
  /** Row press (icon + label) — host decides: link → browser, file → one-time
   * download link. */
  onPressDraft?: (draft: AnnouncementDraftAttachment) => void;
  /** Mirrors every drafts change — the host syncs it into its form values. */
  onAttachmentsChange?: (attachments: AnnouncementDraftAttachment[]) => void;
  /** File pick/upload failure (the host shows the error toast). */
  onError?: (error: unknown) => void;
};

function GroupHeader({
  label,
  plusTestID,
  plusA11yLabel,
  disabled,
  onPressPlus,
  hidden,
}: {
  label: string;
  plusTestID: string;
  plusA11yLabel: string;
  disabled: boolean;
  onPressPlus: () => void;
  hidden?: boolean;
}) {
  return (
    <UiView className="bg-surface flex-row items-center px-4 py-2.5">
      <UiText className="flex-1 text-center text-sm font-semibold text-foreground">{label}</UiText>
      {hidden ? null : (
        <UiPressable
          accessibilityRole="button"
          accessibilityLabel={plusA11yLabel}
          disabled={disabled}
          onPress={onPressPlus}
          hitSlop={12}
          testID={plusTestID}
        >
          <UiIcon name="add-circle-outline" size={24} className="text-muted" />
        </UiPressable>
      )}
    </UiView>
  );
}

function DraftRow({
  label,
  icon,
  openTestID,
  removeTestID,
  testID,
  onPress,
  onRemove,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  openTestID?: string;
  removeTestID?: string;
  testID?: string;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  return (
    <UiView className="bg-surface flex-row items-center px-4 py-3 gap-3" testID={testID}>
      <UiPressable
        className="flex-1 min-w-0 flex-row items-center gap-3"
        onPress={onPress}
        testID={openTestID}
      >
        <UiIcon name={icon} size={16} className="text-muted" />
        <UiText className="flex-1 min-w-0 text-sm text-foreground" numberOfLines={1}>
          {label}
        </UiText>
      </UiPressable>
      {onRemove ? (
        <UiPressable onPress={onRemove} hitSlop={12} testID={removeTestID}>
          <UiIcon name="trash-outline" size={18} className="text-muted" />
        </UiPressable>
      ) : null}
    </UiView>
  );
}

function EmptyRow({ message, testID }: { message: string; testID: string }) {
  return (
    <UiView className="bg-surface items-center px-4 py-3" testID={testID}>
      <UiText className="text-sm text-muted text-center">{message}</UiText>
    </UiView>
  );
}

export function BlockAttachmentEditor({
  initialAttachments,
  texts,
  busy,
  readOnly,
  testIDPrefix = "announcement-attachment",
  onPickFiles,
  onRequestAddLink,
  onPressDraft,
  onAttachmentsChange,
  onError,
}: Props) {
  const [attachments, setAttachments] = useState<AnnouncementDraftAttachment[]>(
    initialAttachments ?? []
  );
  const [isUploading, setIsUploading] = useState(false);

  const commit = (next: AnnouncementDraftAttachment[]) => {
    setAttachments(next);
    onAttachmentsChange?.(next);
  };

  const append = (draft: AnnouncementDraftAttachment) => {
    commit([...attachments, draft]);
  };

  const handlePickFiles = async () => {
    if (!onPickFiles) return;
    try {
      setIsUploading(true);
      const picked = await onPickFiles();
      if (picked.length > 0) commit([...attachments, ...picked]);
    } catch (e) {
      onError?.(e);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (index: number) => {
    commit(attachments.filter((_, i) => i !== index));
  };

  const disabled = busy || isUploading;

  const files = attachments.filter(
    (a): a is Extract<AnnouncementDraftAttachment, { kind: "file" }> => a.kind === "file"
  );
  const links = attachments.filter(
    (a): a is Extract<AnnouncementDraftAttachment, { kind: "link" }> => a.kind === "link"
  );

  return (
    <UiView className="gap-2">
      <UiLabel className="mb-1">{texts.label}</UiLabel>

      <BlockGroupedList
        retryLabel=""
        retryTitle=""
        headerRow={
          <GroupHeader
            label={texts.filesLabel}
            plusTestID={testIds.attachment(testIDPrefix, "add-file")}
            plusA11yLabel={texts.addFile}
            disabled={disabled}
            onPressPlus={() => void handlePickFiles()}
            hidden={readOnly}
          />
        }
      >
        {files.length > 0
          ? files.map((file, i) => (
              <DraftRow
                key={`${file.kind}-${i}-${file.url}`}
                label={file.filename}
                icon="document-text-outline"
                openTestID={testIds.attachment(testIDPrefix, `file-open-${i}`)}
                removeTestID={
                  readOnly ? undefined : testIds.attachment(testIDPrefix, `file-remove-${i}`)
                }
                onPress={onPressDraft ? () => onPressDraft(file) : undefined}
                onRemove={readOnly ? undefined : () => removeAt(attachments.indexOf(file))}
                testID={testIds.attachment(testIDPrefix, `file-row-${i}`)}
              />
            ))
          : [
              <EmptyRow
                key="files-empty"
                message={texts.filesEmpty}
                testID={testIds.attachment(testIDPrefix, "files-empty")}
              />,
            ]}
      </BlockGroupedList>

      <BlockGroupedList
        retryLabel=""
        retryTitle=""
        headerRow={
          <GroupHeader
            label={texts.linksLabel}
            plusTestID={testIds.attachment(testIDPrefix, "add-link")}
            plusA11yLabel={texts.addLink}
            disabled={disabled}
            onPressPlus={() => onRequestAddLink?.(append)}
            hidden={readOnly}
          />
        }
      >
        {links.length > 0
          ? links.map((link, i) => (
              <DraftRow
                key={`${link.kind}-${i}-${link.url}`}
                label={link.label || link.url}
                icon="link-outline"
                openTestID={testIds.attachment(testIDPrefix, `link-open-${i}`)}
                removeTestID={
                  readOnly ? undefined : testIds.attachment(testIDPrefix, `link-remove-${i}`)
                }
                onPress={onPressDraft ? () => onPressDraft(link) : undefined}
                onRemove={readOnly ? undefined : () => removeAt(attachments.indexOf(link))}
                testID={testIds.attachment(testIDPrefix, `link-row-${i}`)}
              />
            ))
          : [
              <EmptyRow
                key="links-empty"
                message={texts.linksEmpty}
                testID={testIds.attachment(testIDPrefix, "links-empty")}
              />,
            ]}
      </BlockGroupedList>
    </UiView>
  );
}

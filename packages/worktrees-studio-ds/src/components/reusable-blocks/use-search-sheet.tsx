import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTeleport } from "../teleport";
import { BlockFormSheet } from "./block-form-sheet";
import { BlockFormSubmit } from "./block-form-submit";

export type SearchSheetTexts = {
  /** Navbar menu item label that opens the sheet (e.g. "Cari"). */
  menuLabel: string;
  title: string;
  subtitle: string;
  placeholder: string;
  submitLabel: string;
};

type Options = {
  texts: SearchSheetTexts;
  /** Currently applied query — prefills the sheet so it can be edited/cleared. */
  query: string;
  /** Applied on footer submit; the host resets its cursor and refetches. */
  onSubmit: (query: string) => void;
  /** testIDs: `<prefix>-input` (field) and `<prefix>-submit` (footer). */
  testIDPrefix: string;
};

/**
 * Search-in-a-fullsheet: list screens stay clean flatlists and expose search
 * through the navbar action menu. The sheet owns a single controlled field and
 * a docked footer submit (mandatory title + subtitle per the sheet contract).
 */
export function useSearchSheet({ texts, query, onSubmit, testIDPrefix }: Options) {
  const { showFullSheet } = useTeleport();
  const form = useForm<{ query: string }>({ defaultValues: { query } });

  return useCallback(() => {
    form.reset({ query });
    const sheet = showFullSheet(
      <BlockFormSheet
        form={form}
        fieldName="query"
        title={texts.title}
        subtitle={texts.subtitle}
        label={texts.title}
        placeholder={texts.placeholder}
        fieldTestID={`${testIDPrefix}-input`}
      />,
      <BlockFormSubmit
        form={form}
        submitLabel={texts.submitLabel}
        submitTestID={`${testIDPrefix}-submit`}
        onSubmit={({ query: next }) => {
          onSubmit(next.trim());
          sheet.close();
        }}
      />,
      { title: texts.title, subtitle: texts.subtitle }
    );
  }, [form, onSubmit, query, showFullSheet, testIDPrefix, texts]);
}

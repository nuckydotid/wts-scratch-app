import type { ReactNode } from "react";
import { UiView, UiText } from "../heroui-primitive";
import { BlockDismissKeysArea } from "./block-dismiss-keys-area";

type Props = {
  title: string;
  subtitle?: string;
  /** Optional wizard steps bar rendered below the title/subtitle (pinned —
   *  never scrolls with the content). */
  stepsBar?: ReactNode;
};

/**
 * Full-sheet form header — the consistent title + subtitle pair every sheet
 * form uses (invite/edit teacher, create/edit student, single-field sheets).
 * Sheet forms are card-free, so the header sits directly on `bg-background`.
 */
export function BlockFormSheetHeader({ title, subtitle, stepsBar }: Props) {
  return (
    <UiView>
      <BlockDismissKeysArea>
        <UiText className="text-xl font-semibold text-foreground mb-2">{title}</UiText>
      </BlockDismissKeysArea>
      {subtitle ? (
        <BlockDismissKeysArea>
          <UiText className="text-sm text-muted mb-4">{subtitle}</UiText>
        </BlockDismissKeysArea>
      ) : null}
      {stepsBar}
    </UiView>
  );
}

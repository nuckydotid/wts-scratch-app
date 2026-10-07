import type { ReactNode } from "react";
import { UiView } from "../heroui-primitive";

/**
 * Body container for screens that render both standalone and `embedded`
 * inside a fullsheet.
 *
 * The sheet host owns the outer inset (the pinned header sits at that same
 * px-5 inset), so an embedded body must never add its own outer padding —
 * that was the Sprint 5 "fields indent past the title" regression. Standalone
 * use passes its page padding through `className`.
 *
 * The contract test (`sheet-screen-body.contract.test.tsx`) fails when an
 * `embedded` branch reintroduces outer padding tokens.
 */
export function SheetScreenBody({
  children,
  className,
  testID = "sheet-screen-body",
}: {
  children: ReactNode;
  className?: string;
  testID?: string;
}) {
  return (
    <UiView testID={testID} className={className ? `flex-1 ${className}` : "flex-1"}>
      {children}
    </UiView>
  );
}

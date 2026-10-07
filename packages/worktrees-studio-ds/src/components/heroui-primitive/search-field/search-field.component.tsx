import { SearchField as HeroSearchField } from "heroui-native/search-field";
import type { ComponentProps } from "react";

export type UiSearchFieldProps = ComponentProps<typeof HeroSearchField>;

export const UiSearchField = Object.assign(function UiSearchField({
  className,
  ...props
}: UiSearchFieldProps) {
  return <HeroSearchField className={`font-normal ${className ?? ""}`} {...props} />;
}, HeroSearchField);

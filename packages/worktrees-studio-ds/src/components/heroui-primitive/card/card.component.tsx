import { Card as HeroCard } from "heroui-native/card";
import type { CardRootProps } from "heroui-native/card";
import type { ReactNode } from "react";

export interface UiCardProps extends CardRootProps {
  children?: ReactNode;
}

export const UiCard = Object.assign(function UiCard({ children, ...props }: UiCardProps) {
  return <HeroCard {...props}>{children}</HeroCard>;
}, HeroCard);
UiCard.displayName = "UiCard";

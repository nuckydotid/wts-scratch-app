import type { ReactNode } from "react";
import type { ControlDef } from "../../../hooks/use-controls";

import { SignUpFlowBlock } from "./sign-up-flow.expo-story";

export type { ControlDef };

export interface ComponentDef {
  label: string;
  category: string;
  controls?: Record<string, ControlDef>;
  render: (props: Record<string, unknown>) => ReactNode;
}

export interface CategoryGroup {
  name: string;
  items: { name: string; label: string }[];
}

/** Flows open on the pan/zoom canvas (`/expo-story/flows/<name>`), the rest on a single phone frame. */
export const blockRegistry: Record<string, ComponentDef> = {
  "sign-up-flow": SignUpFlowBlock,
};

function buildCategories(): CategoryGroup[] {
  const map: Record<string, CategoryGroup> = {};
  for (const [name, block] of Object.entries(blockRegistry)) {
    if (!map[block.category]) map[block.category] = { name: block.category, items: [] };
    map[block.category].items.push({ name, label: block.label });
  }
  return Object.values(map).map((cat) => ({ ...cat, items: [...cat.items].sort((a, b) => a.label.localeCompare(b.label)) }));
}

export const categories = buildCategories();

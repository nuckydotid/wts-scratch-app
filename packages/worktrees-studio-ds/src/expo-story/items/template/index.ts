import type { ReactNode } from "react";
import type { ControlDef } from "../../../hooks/use-controls";

import { TemplateScrollableScreenBlock } from "./template-scrollable-screen.expo-story";
import { TemplateFlatListScreenBlock } from "./template-flat-list-screen.expo-story";
import { TemplateSearchableSectionListScreenBlock } from "./template-searchable-section-list-screen.expo-story";

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

export const blockRegistry: Record<string, ComponentDef> = {
  "template-scrollable-screen": TemplateScrollableScreenBlock,
  "template-flat-list-screen": TemplateFlatListScreenBlock,
  "template-searchable-section-list-screen": TemplateSearchableSectionListScreenBlock,
};

function buildCategories(): CategoryGroup[] {
  const map: Record<string, CategoryGroup> = {};
  for (const [name, block] of Object.entries(blockRegistry)) {
    if (!map[block.category]) {
      map[block.category] = { name: block.category, items: [] };
    }
    map[block.category].items.push({ name, label: block.label });
  }
  return Object.values(map).map((cat) => ({
    ...cat,
    items: [...cat.items].sort((a, b) => a.label.localeCompare(b.label)),
  }));
}

export const categories = buildCategories();

import type { ReactNode } from "react";
import type { ControlDef } from "../../../hooks/use-controls";

import { TeleportBs } from "./teleport-bs.expo-story";
import { TeleportToast } from "./teleport-toast.expo-story";
import { TeleportDrawerBlock } from "./teleport-drawer.expo-story";
import { TeleportFullSheet } from "./teleport-full-sheet.expo-story";
import { TeleportDatePicker } from "./teleport-date-picker.expo-story";
import { TeleportMenu } from "./teleport-menu.expo-story";
import { TeleportTabBarBlock } from "./teleport-tab-bar.expo-story";
import { TeleportMediaViewerBlock } from "./teleport-media-viewer.expo-story";

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
  "teleport-bs": TeleportBs,
  "teleport-toast": TeleportToast,
  "teleport-drawer": TeleportDrawerBlock,
  "teleport-full-sheet": TeleportFullSheet,
  "teleport-date-picker": TeleportDatePicker,
  "teleport-menu": TeleportMenu,
  "teleport-tab-bar": TeleportTabBarBlock,
  "teleport-media-viewer": TeleportMediaViewerBlock,
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

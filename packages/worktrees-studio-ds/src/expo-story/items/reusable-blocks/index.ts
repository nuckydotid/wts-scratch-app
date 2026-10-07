import type { ReactNode } from "react";
import type { ControlDef } from "../../../hooks/use-controls";

import { BlockNavBarBlock } from "./block-nav-bar.expo-story";
import { BlockScreenHeaderBlock } from "./block-screen-header.expo-story";
import { BlockEmailFormBlock } from "./block-email-form.expo-story";
import { BlockSocialAuthBlock } from "./block-social-auth.expo-story";
import { BlockGuidanceTipBlock } from "./block-guidance-tip.expo-story";
import { BlockOtpFormBlock } from "./block-otp-form.expo-story";
import { BlockStatCardBlock } from "./block-stat-card.expo-story";
import { BlockGroupedListBlock } from "./block-grouped-list.expo-story";
import { BlockEmptyStateBlock } from "./block-empty-state.expo-story";
import { BlockLoadingStateBlock } from "./block-loading-state.expo-story";
import { BlockErrorStateBlock } from "./block-error-state.expo-story";
import { BlockRetryBlock } from "./block-retry.expo-story";
import { BlockProfileHeaderBlock } from "./block-profile-header.expo-story";
import { BlockConfirmSheetBlock } from "./block-confirm-sheet.expo-story";
import { BlockOptionSheetBlock } from "./block-option-sheet.expo-story";
import { BlockFormSheetBlock } from "./block-form-sheet.expo-story";
import { BlockMediaPickerBlock } from "./block-media-picker.expo-story";
import { BlockFilterSheetBlock } from "./block-filter-sheet.expo-story";
import { BlockFormBlock } from "./block-form.expo-story";
import { BlockHomeHeroBlock } from "./block-home-hero.expo-story";
import { BlockSearchableSelectSheetBlock } from "./block-searchable-select-sheet.expo-story";
import { BlockLineChartBlock } from "./block-line-chart.expo-story";
import { BlockIdCardBlock } from "./block-id-card.expo-story";
import { BlockProgressSheetBlock } from "./block-progress-sheet.expo-story";
import { BlockChatBubbleBlock } from "./block-chat-bubble.expo-story";
import { BlockChatInputBlock } from "./block-chat-input.expo-story";

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
  "block-nav-bar": BlockNavBarBlock,
  "block-screen-header": BlockScreenHeaderBlock,
  "block-email-form": BlockEmailFormBlock,
  "block-social-auth": BlockSocialAuthBlock,
  "block-guidance-tip": BlockGuidanceTipBlock,
  "block-otp-form": BlockOtpFormBlock,
  "block-stat-card": BlockStatCardBlock,
  "block-grouped-list": BlockGroupedListBlock,
  "block-empty-state": BlockEmptyStateBlock,
  "block-loading-state": BlockLoadingStateBlock,
  "block-error-state": BlockErrorStateBlock,
  "block-retry": BlockRetryBlock,
  "block-profile-header": BlockProfileHeaderBlock,
  "block-confirm-sheet": BlockConfirmSheetBlock,
  "block-option-sheet": BlockOptionSheetBlock,
  "block-form-sheet": BlockFormSheetBlock,
  "block-media-picker": BlockMediaPickerBlock,
  "block-filter-sheet": BlockFilterSheetBlock,
  "block-form": BlockFormBlock,
  "block-home-hero": BlockHomeHeroBlock,
  "block-searchable-select-sheet": BlockSearchableSelectSheetBlock,
  "block-line-chart": BlockLineChartBlock,
  "block-id-card": BlockIdCardBlock,
  "block-progress-sheet": BlockProgressSheetBlock,
  "block-chat-bubble": BlockChatBubbleBlock,
  "block-chat-input": BlockChatInputBlock,
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

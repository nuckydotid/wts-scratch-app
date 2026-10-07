import type { ReactNode } from "react";
import type { ControlDef } from "../../../hooks/use-controls";

import { UIAccordion } from "./ui-accordion.expo-story";
import { UIAlert } from "./ui-alert.expo-story";
import { UIButton } from "./ui-button.expo-story";
import { UICard } from "./ui-card.expo-story";
import { UICheckbox } from "./ui-checkbox.expo-story";
import { UIChip } from "./ui-chip.expo-story";
import { UICloseButton } from "./ui-close-button.expo-story";
import { UIControlField } from "./ui-control-field.expo-story";
import { UIDescription } from "./ui-description.expo-story";
import { UIFieldError } from "./ui-field-error.expo-story";
import { UIInput } from "./ui-input.expo-story";
import { UILabel } from "./ui-label.expo-story";
import { UILinkButton } from "./ui-link-button.expo-story";
import { UIListGroup } from "./ui-list-group.expo-story";
import { UISearchField } from "./ui-search-field.expo-story";
import { UISeparator } from "./ui-separator.expo-story";
import { UISkeleton } from "./ui-skeleton.expo-story";
import { UISpinner } from "./ui-spinner.expo-story";
import { UISwitch } from "./ui-switch.expo-story";
import { UITagGroup } from "./ui-tag-group.expo-story";
import { UIText } from "./ui-text.expo-story";
import { UITextField } from "./ui-text-field.expo-story";
import { UIAvatar } from "./ui-avatar.expo-story";
import { UIRadio } from "./ui-radio.expo-story";
import { UIRadioGroup } from "./ui-radio-group.expo-story";
import { UISlider } from "./ui-slider.expo-story";
import { UISurface } from "./ui-surface.expo-story";
import { UITabs } from "./ui-tabs.expo-story";
import { UITextArea } from "./ui-text-area.expo-story";

export type { ControlDef };

/** One selectable story case — replaces the generic controls panel for
 * screens: each card in the case panel is a radio row backed by this. */
export interface CaseDef {
  id: string;
  label: string;
  props: Record<string, unknown>;
}

export interface ComponentDef {
  label: string;
  category: string;
  controls?: Record<string, ControlDef>;
  cases?: CaseDef[];
  render: (props: Record<string, unknown>) => ReactNode;
}

export interface CategoryGroup {
  name: string;
  items: { name: string; label: string }[];
}

export const blockRegistry: Record<string, ComponentDef> = {
  accordion: UIAccordion,
  alert: UIAlert,
  button: UIButton,
  card: UICard,
  checkbox: UICheckbox,
  chip: UIChip,
  "close-button": UICloseButton,
  "control-field": UIControlField,
  description: UIDescription,
  "field-error": UIFieldError,
  input: UIInput,
  label: UILabel,
  "link-button": UILinkButton,
  "list-group": UIListGroup,
  "search-field": UISearchField,
  separator: UISeparator,
  skeleton: UISkeleton,
  spinner: UISpinner,
  switch: UISwitch,
  "tag-group": UITagGroup,
  text: UIText,
  "text-field": UITextField,
  avatar: UIAvatar,
  radio: UIRadio,
  "radio-group": UIRadioGroup,
  slider: UISlider,
  surface: UISurface,
  tabs: UITabs,
  "text-area": UITextArea,
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

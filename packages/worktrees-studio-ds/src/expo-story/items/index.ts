import * as herouiPrimitive from "./heroui-primitive";
import * as teleport from "./teleport";
import * as reusableBlocks from "./reusable-blocks";
import * as template from "./template";
import * as flows from "./flows";

import type { ComponentDef } from "./heroui-primitive";

export type { ComponentDef, CategoryGroup, ControlDef } from "./heroui-primitive";

export const blockRegistry: Record<string, ComponentDef> = {
  ...herouiPrimitive.blockRegistry,
  ...teleport.blockRegistry,
  ...reusableBlocks.blockRegistry,
  ...template.blockRegistry,
  ...flows.blockRegistry,
};

function buildCategories() {
  return [
    ...herouiPrimitive.categories,
    ...teleport.categories,
    ...reusableBlocks.categories,
    ...template.categories,
    ...flows.categories,
  ].map((cat) => ({
    ...cat,
    items: [...cat.items].sort((a, b) => a.label.localeCompare(b.label)),
  }));
}

export const categories = buildCategories();

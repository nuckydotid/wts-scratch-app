import { useState } from "react";
import { UiView, MonoText, UiPressable, UiIcon } from "../../components";
import { ComponentItem } from "./component-item";

interface SidebarCategoryProps {
  name: string;
  items: { name: string; label: string }[];
  activeName?: string;
}

export function SidebarCategory({ name, items, activeName }: SidebarCategoryProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <UiView className="mb-3">
      <UiPressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${name} category`}
        className="flex-row items-center px-2 py-1"
      >
        <MonoText className="text-xs font-semibold text-muted tracking-wider uppercase flex-1">
          {name}
        </MonoText>
        <UiIcon
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={14}
          className="text-muted"
        />
      </UiPressable>
      {expanded &&
        items.map((item) => (
          <ComponentItem
            key={item.name}
            name={item.name}
            label={item.label}
            category={name}
            isActive={activeName === item.name}
          />
        ))}
    </UiView>
  );
}

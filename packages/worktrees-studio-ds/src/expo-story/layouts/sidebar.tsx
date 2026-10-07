import { useState } from "react";
import { UiView, UiScrollView } from "../../components";
import { useSegments } from "expo-router";
import { SearchInput } from "./search-input";
import { SidebarCategory } from "./sidebar-category";
import { categories } from "../items";

export function Sidebar() {
  const segments = useSegments();
  const name = segments[segments.length - 1];
  const [search, setSearch] = useState("");

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => !search || item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <UiView className="w-[375px] bg-background">
      <SearchInput value={search} onChange={setSearch} />
      <UiScrollView className="flex-1">
        {filtered.map((cat) => (
          <SidebarCategory
            key={cat.name}
            name={cat.name}
            items={cat.items}
            activeName={name as string}
          />
        ))}
      </UiScrollView>
    </UiView>
  );
}

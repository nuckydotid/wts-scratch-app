import { Link } from "expo-router";
import { MonoText, UiView } from "../../components";

interface ComponentItemProps {
  name: string;
  label: string;
  isActive: boolean;
  category?: string;
}

export function ComponentItem({ name, label, isActive, category }: ComponentItemProps) {
  const prefix = category === "flows" ? "/expo-story/flows/" : "/expo-story/blocks/";
  return (
    <Link href={`${prefix}${name}` as any} asChild>
      <UiView
        className={`flex-row items-center pl-6 pr-2 py-1 rounded-lg ${isActive ? "bg-accent" : ""}`}
      >
        <MonoText
          className={`text-xs font-medium ${isActive ? "text-accent-foreground" : "text-foreground"}`}
        >
          {label}
        </MonoText>
      </UiView>
    </Link>
  );
}

import { BlockScreenHeader } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";

export const BlockScreenHeaderBlock: ComponentDef = {
  label: "BlockScreenHeader",
  category: "reusable blocks",
  controls: {
    title: { type: "text", default: "Welcome back" },
    subtitle: { type: "text", default: "Enter your email to receive a verification code" },
  },
  render: (p) => <BlockScreenHeader title={p.title as string} subtitle={p.subtitle as string} />,
};

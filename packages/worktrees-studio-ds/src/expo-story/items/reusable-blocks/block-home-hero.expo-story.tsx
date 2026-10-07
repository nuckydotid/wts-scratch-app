import { BlockHomeHero } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

const ASSET_BASE = "https://worker.example.com/api/assets";

export const BlockHomeHeroBlock: ComponentDef = {
  label: "BlockHomeHero",
  category: "reusable blocks",
  controls: {
    welcome: C.txt("Welcome, Teacher. Track your students' development."),
    hint: C.txt("Select a class below or scan a student card to see details."),
    scanLabel: C.txt("Scan QR"),
    characterImage: C.txt(`${ASSET_BASE}/characters/holding-hands-char.png`),
    showCharacter: C.bool(true),
    showAnnouncementButton: C.bool(true),
  },
  render: (p) => (
    <BlockHomeHero
      welcome={p.welcome as string}
      hint={p.hint as string}
      scanLabel={p.scanLabel as string}
      characterImage={p.showCharacter ? (p.characterImage as string) : undefined}
      scanButtonTestID="home-hero-scan"
      announcementButtonTestID="home-hero-announcement"
    />
  ),
};

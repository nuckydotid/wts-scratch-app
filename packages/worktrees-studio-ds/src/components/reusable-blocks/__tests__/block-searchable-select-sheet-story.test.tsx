import { BlockSearchableSelectSheetBlock } from "../../../expo-story/items/reusable-blocks/block-searchable-select-sheet.expo-story";
import { BlockIdCardBlock } from "../../../expo-story/items/reusable-blocks/block-id-card.expo-story";
import { TemplateSearchableSectionListScreenBlock } from "../../../expo-story/items/template/template-searchable-section-list-screen.expo-story";
import { testBlockControls } from "../../heroui-primitive/test-helpers";

testBlockControls(BlockSearchableSelectSheetBlock, (p) =>
  BlockSearchableSelectSheetBlock.render(p)
);

testBlockControls(BlockIdCardBlock, (p) => BlockIdCardBlock.render(p));

testBlockControls(TemplateSearchableSectionListScreenBlock, (p) =>
  TemplateSearchableSectionListScreenBlock.render(p)
);

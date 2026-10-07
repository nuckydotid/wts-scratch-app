import { BlockMediaPickerBlock } from "../../../expo-story/items/reusable-blocks/block-media-picker.expo-story";
import { BlockMediaPicker } from "../block-media-picker";
import { testBlockControls } from "../../heroui-primitive/test-helpers";

testBlockControls(BlockMediaPickerBlock, (p) => <BlockMediaPicker {...(p as any)} />);

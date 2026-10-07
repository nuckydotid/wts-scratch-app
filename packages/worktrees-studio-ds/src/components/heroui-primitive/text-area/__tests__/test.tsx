import { UITextArea } from "../../../../expo-story/items/heroui-primitive/ui-text-area.expo-story";
import { UiTextArea } from "../text-area.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UITextArea, (p) => <UiTextArea {...(p as any)} />);

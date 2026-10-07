import { UIText } from "../../../../expo-story/items/heroui-primitive/ui-text.expo-story";
import { UiText } from "../text.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIText, (p) => <UiText {...(p as any)} />);

import { UIInput } from "../../../../expo-story/items/heroui-primitive/ui-input.expo-story";
import { UiInput } from "../input.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIInput, (p) => <UiInput {...(p as any)} />);

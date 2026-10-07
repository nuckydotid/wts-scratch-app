import { UITextField } from "../../../../expo-story/items/heroui-primitive/ui-text-field.expo-story";
import { UiTextField } from "../text-field.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UITextField, (p) => <UiTextField {...(p as any)} />);

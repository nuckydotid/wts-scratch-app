import { UISwitch } from "../../../../expo-story/items/heroui-primitive/ui-switch.expo-story";
import { UiSwitch } from "../switch.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISwitch, (p) => <UiSwitch {...(p as any)} />);

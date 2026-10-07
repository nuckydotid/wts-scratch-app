import { UIRadioGroup } from "../../../../expo-story/items/heroui-primitive/ui-radio-group.expo-story";
import { UiRadioGroup } from "../radio-group.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIRadioGroup, (p) => <UiRadioGroup {...(p as any)} />);

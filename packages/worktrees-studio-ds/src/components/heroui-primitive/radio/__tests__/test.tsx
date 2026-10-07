import { UIRadio } from "../../../../expo-story/items/heroui-primitive/ui-radio.expo-story";
import { UiRadio } from "../radio.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIRadio, (p) => <UiRadio {...(p as any)} />);

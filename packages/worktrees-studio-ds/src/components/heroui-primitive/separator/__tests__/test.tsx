import { UISeparator } from "../../../../expo-story/items/heroui-primitive/ui-separator.expo-story";
import { UiSeparator } from "../separator.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISeparator, (p) => <UiSeparator {...(p as any)} />);

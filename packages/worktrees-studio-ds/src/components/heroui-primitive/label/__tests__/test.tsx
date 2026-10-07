import { UILabel } from "../../../../expo-story/items/heroui-primitive/ui-label.expo-story";
import { UiLabel } from "../label.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UILabel, (p) => <UiLabel {...(p as any)} />);

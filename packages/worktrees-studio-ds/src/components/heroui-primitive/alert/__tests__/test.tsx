import { UIAlert } from "../../../../expo-story/items/heroui-primitive/ui-alert.expo-story";
import { UiAlert } from "../alert.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIAlert, (p) => <UiAlert {...(p as any)} />);

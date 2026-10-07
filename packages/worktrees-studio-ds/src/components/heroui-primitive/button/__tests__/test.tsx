import { UIButton } from "../../../../expo-story/items/heroui-primitive/ui-button.expo-story";
import { UiButton } from "../button.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIButton, (p) => <UiButton {...(p as any)} />);

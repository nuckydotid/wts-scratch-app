import { UICloseButton } from "../../../../expo-story/items/heroui-primitive/ui-close-button.expo-story";
import { UiCloseButton } from "../close-button.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UICloseButton, (p) => <UiCloseButton {...(p as any)} />);

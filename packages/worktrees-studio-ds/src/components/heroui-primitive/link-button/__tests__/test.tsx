import { UILinkButton } from "../../../../expo-story/items/heroui-primitive/ui-link-button.expo-story";
import { UiLinkButton } from "../link-button.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UILinkButton, (p) => <UiLinkButton {...(p as any)} />);

import { UIAvatar } from "../../../../expo-story/items/heroui-primitive/ui-avatar.expo-story";
import { UiAvatar } from "../avatar.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIAvatar, (p) => <UiAvatar {...(p as any)} />);

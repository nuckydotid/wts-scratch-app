import { UISurface } from "../../../../expo-story/items/heroui-primitive/ui-surface.expo-story";
import { UiSurface } from "../surface.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISurface, (p) => <UiSurface {...(p as any)} />);

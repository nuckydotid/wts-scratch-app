import { UISkeleton } from "../../../../expo-story/items/heroui-primitive/ui-skeleton.expo-story";
import { UiSkeleton } from "../skeleton.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISkeleton, (p) => <UiSkeleton {...(p as any)} />);

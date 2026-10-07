import { UIListGroup } from "../../../../expo-story/items/heroui-primitive/ui-list-group.expo-story";
import { UiListGroup } from "../list-group.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIListGroup, (p) => <UiListGroup {...(p as any)} />);

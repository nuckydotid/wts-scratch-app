import { UITagGroup } from "../../../../expo-story/items/heroui-primitive/ui-tag-group.expo-story";
import { UiTagGroup } from "../tag-group.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UITagGroup, (p) => <UiTagGroup {...(p as any)} />);

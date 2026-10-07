import { UITabs } from "../../../../expo-story/items/heroui-primitive/ui-tabs.expo-story";
import { UiTabs } from "../tabs.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UITabs, (p) => <UiTabs {...(p as any)} />);

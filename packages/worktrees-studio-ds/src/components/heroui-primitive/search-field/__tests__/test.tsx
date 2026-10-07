import { UISearchField } from "../../../../expo-story/items/heroui-primitive/ui-search-field.expo-story";
import { UiSearchField } from "../search-field.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISearchField, (p) => <UiSearchField {...(p as any)} />);

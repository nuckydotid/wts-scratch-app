import { UIAccordion } from "../../../../expo-story/items/heroui-primitive/ui-accordion.expo-story";
import { UiAccordion } from "../accordion.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIAccordion, (p) => <UiAccordion {...(p as any)} />);

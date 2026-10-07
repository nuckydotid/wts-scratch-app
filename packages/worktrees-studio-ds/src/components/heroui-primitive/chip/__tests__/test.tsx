import { UIChip } from "../../../../expo-story/items/heroui-primitive/ui-chip.expo-story";
import { UiChip } from "../chip.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UIChip, (p) => <UiChip {...(p as any)} />);

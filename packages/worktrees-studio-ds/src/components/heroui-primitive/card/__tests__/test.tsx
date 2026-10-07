import { UICard } from "../../../../expo-story/items/heroui-primitive/ui-card.expo-story";
import { UiCard } from "../card.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UICard, (p) => <UiCard {...(p as any)} />);

import { UISlider } from "../../../../expo-story/items/heroui-primitive/ui-slider.expo-story";
import { UiSlider } from "../slider.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISlider, (p) => <UiSlider {...(p as any)} />);

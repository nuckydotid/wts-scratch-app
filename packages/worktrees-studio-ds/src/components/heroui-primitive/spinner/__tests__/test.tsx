import { UISpinner } from "../../../../expo-story/items/heroui-primitive/ui-spinner.expo-story";
import { UiSpinner } from "../spinner.component";
import { testBlockControls } from "../../test-helpers";

testBlockControls(UISpinner, (p) => <UiSpinner {...(p as any)} />);

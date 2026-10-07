import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Hook to handle Android hardware / system back button presses.
 * Directly aligns with `@react-native-community/hooks` useBackHandler specification.
 *
 * @param handler Function called when back is pressed. Return `true` to consume the event, `false` to bubble.
 */
export function useBackHandler(handler: () => boolean): void {
  useEffect(() => {
    // There is no hardware back button on web (react-native-web logs an error for BackHandler listeners).
    if (Platform.OS === "web") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", handler);
    return () => subscription.remove();
  }, [handler]);
}

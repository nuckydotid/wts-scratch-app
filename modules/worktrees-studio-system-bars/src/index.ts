import { NativeModule, requireNativeModule } from "expo";

declare class WorktreesStudioSystemBarsModule extends NativeModule<
  Record<string, never>
> {
  setAppearanceAsync(
    lightStatusBar: boolean,
    lightNavigationBar: boolean,
  ): Promise<void>;
  getAppearanceAsync(): Promise<{
    lightStatusBar: boolean;
    lightNavigationBar: boolean;
  }>;
}

/**
 * Sets the Android system bar icon appearances directly on the window insets
 * controller (bypasses RN's StatusBar path, which does not apply on this
 * setup): `light` = dark icons (for light backgrounds), `false` = light
 * icons (for dark backgrounds).
 */
export async function setSystemBarsAppearance(
  lightStatusBar: boolean,
  lightNavigationBar: boolean,
): Promise<void> {
  const module =
    requireNativeModule<WorktreesStudioSystemBarsModule>("WorktreesStudioSystemBars");
  return module.setAppearanceAsync(lightStatusBar, lightNavigationBar);
}

export async function getSystemBarsAppearance(): Promise<{
  lightStatusBar: boolean;
  lightNavigationBar: boolean;
}> {
  const module =
    requireNativeModule<WorktreesStudioSystemBarsModule>("WorktreesStudioSystemBars");
  return module.getAppearanceAsync();
}

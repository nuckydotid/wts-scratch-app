package expo.modules.worktreesstudiosystembars

import android.os.Build
import android.view.WindowInsetsController
import android.util.Log
import android.view.View
import androidx.core.view.WindowInsetsControllerCompat
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WorktreesStudioSystemBarsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WorktreesStudioSystemBars")

    AsyncFunction("setAppearanceAsync") { lightStatusBar: Boolean, lightNavigationBar: Boolean ->
      val activity = appContext.throwingActivity
      Log.i(TAG, "setAppearanceAsync lightStatusBar=$lightStatusBar lightNav=$lightNavigationBar")

      // Modern paths: the compat wrapper + the raw platform controller (the
      // SystemUI reads the window's own controller — set both directly).
      val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
      controller.isAppearanceLightStatusBars = lightStatusBar
      controller.isAppearanceLightNavigationBars = lightNavigationBar
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        // getWindowInsetsController is hidden on API 29 — only touch the raw
        // platform controller where it is public (API 30+); the compat covers
        // API 29 via the legacy systemUiVisibility flags below.
        activity.window.decorView.windowInsetsController?.setSystemBarsAppearance(
          if (lightStatusBar) WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS else 0,
          WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
        )
        activity.window.decorView.windowInsetsController?.setSystemBarsAppearance(
          if (lightNavigationBar) WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS else 0,
          WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
        )
      }
      Log.i(TAG, "after-set readback lightStatusBar=${controller.isAppearanceLightStatusBars}")

      // Legacy path: the decor view's systemUiVisibility flags — the most
      // direct signal Android has, honored by the SystemUI on every version.
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
        var flags = activity.window.decorView.systemUiVisibility
        flags =
          if (lightStatusBar) flags or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
          else flags and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
        flags =
          if (lightNavigationBar) flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
          else flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
        activity.window.decorView.systemUiVisibility = flags
      }
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("getAppearanceAsync") { ->
      val activity = appContext.throwingActivity
      val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
      Log.i(
        TAG,
        "getAppearanceAsync lightStatusBar=${controller.isAppearanceLightStatusBars} " +
          "lightNav=${controller.isAppearanceLightNavigationBars}",
      )
      mapOf(
        "lightStatusBar" to controller.isAppearanceLightStatusBars,
        "lightNavigationBar" to controller.isAppearanceLightNavigationBars,
      )
    }.runOnQueue(Queues.MAIN)
  }

  companion object {
    private const val TAG = "WorktreesStudioSystemBars"
  }
}

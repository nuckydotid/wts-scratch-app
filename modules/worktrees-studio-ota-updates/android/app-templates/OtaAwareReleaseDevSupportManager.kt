package expo.modules.worktreesstudiootaupdates

import com.facebook.react.devsupport.ReleaseDevSupportManager

/**
 * [ReleaseDevSupportManager] ignores [bundleFilePath] in release builds. [ReactHostImpl] reads that
 * field when building [JSBundleLoader] on reload, so OTA must use a real backing field.
 */
class OtaAwareReleaseDevSupportManager : ReleaseDevSupportManager() {
  override var bundleFilePath: String? = null
}

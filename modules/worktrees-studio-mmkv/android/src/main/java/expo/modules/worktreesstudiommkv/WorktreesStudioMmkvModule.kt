package expo.modules.worktreesstudiommkv

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WorktreesStudioMmkvModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WorktreesStudioMmkv")

    Function("getString") { instanceId: String, key: String ->
      getPrefs(instanceId).getString(key, null)
    }

    Function("set") { instanceId: String, key: String, value: String ->
      getPrefs(instanceId).edit().putString(key, value).commit()
    }

    Function("remove") { instanceId: String, key: String ->
      getPrefs(instanceId).edit().remove(key).commit()
    }

    Function("contains") { instanceId: String, key: String ->
      getPrefs(instanceId).contains(key)
    }

    Function("clearAll") { instanceId: String ->
      getPrefs(instanceId).edit().clear().commit()
    }
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  private fun getPrefs(instanceId: String): SharedPreferences {
    val prefsName = if (instanceId.isEmpty()) PREF_DEFAULT else "${PREF_PREFIX}_$instanceId"
    return prefsCache.getOrPut(prefsName) {
      createEncryptedPrefs(prefsName)
    }
  }

  private fun createEncryptedPrefs(name: String): SharedPreferences {
    return try {
      val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
      EncryptedSharedPreferences.create(
        context,
        name,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
      )
    } catch (e: Exception) {
      if (Build.VERSION.SDK_INT < 23) {
        context.getSharedPreferences(name, Context.MODE_PRIVATE)
      } else {
        throw e
      }
    }
  }

  companion object {
    private const val PREF_DEFAULT = "worktrees_studio_mmkv"
    private const val PREF_PREFIX = "worktrees_studio_mmkv"
    private val prefsCache = mutableMapOf<String, SharedPreferences>()
  }
}

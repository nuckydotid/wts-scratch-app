package expo.modules.worktreesstudiogooglesignin

import android.app.Activity
import android.content.Intent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

private const val GOOGLE_SIGN_IN_REQUEST_CODE = 9912

class SignInOptions : Record {
  @Field
  val webClientId: String = ""
}

class SignOutOptions : Record {
  @Field
  val webClientId: String = ""
}

class WorktreesStudioGoogleSignInModule : Module() {
  private var pendingPromise: Promise? = null
  private var lastWebClientId: String? = null

  override fun definition() = ModuleDefinition {
    Name("WorktreesStudioGoogleSignIn")

    AsyncFunction("signInAsync") { options: SignInOptions, promise: Promise ->
      val webClientId = options.webClientId.trim()
      if (webClientId.isEmpty()) {
        promise.reject("MISSING_WEB_CLIENT_ID", "missing_web_client_id", null)
        return@AsyncFunction
      }

      if (pendingPromise != null) {
        promise.reject("IN_PROGRESS", "Sign-in already in progress", null)
        return@AsyncFunction
      }

      lastWebClientId = webClientId
      pendingPromise = promise
      val client = buildClient(appContext.throwingActivity, webClientId)
      client.signOut().addOnCompleteListener {
        if (pendingPromise !== promise) {
          return@addOnCompleteListener
        }
        appContext.throwingActivity.startActivityForResult(
          client.signInIntent,
          GOOGLE_SIGN_IN_REQUEST_CODE,
        )
      }
    }

    AsyncFunction("signOutAsync") { options: SignOutOptions?, promise: Promise ->
      val webClientId =
        options?.webClientId?.trim()?.takeIf { it.isNotEmpty() }
          ?: lastWebClientId?.trim().orEmpty()

      if (webClientId.isEmpty()) {
        promise.resolve(null)
        return@AsyncFunction
      }

      buildClient(appContext.throwingActivity, webClientId).signOut().addOnCompleteListener {
        promise.resolve(null)
      }
    }

    OnActivityResult { _, (requestCode, resultCode, data) ->
      if (requestCode != GOOGLE_SIGN_IN_REQUEST_CODE || pendingPromise == null) {
        return@OnActivityResult
      }

      val promise = pendingPromise!!
      pendingPromise = null

      if (resultCode != Activity.RESULT_OK || data == null) {
        promise.reject("CANCELLED", "Cancelled", null)
        return@OnActivityResult
      }

      val task = GoogleSignIn.getSignedInAccountFromIntent(data)
      try {
        val account = task.getResult(ApiException::class.java)
        val idToken = account?.idToken
        if (idToken.isNullOrBlank()) {
          promise.reject("MISSING_ID_TOKEN", "missing_id_token", null)
        } else {
          promise.resolve(mapOf("idToken" to idToken))
        }
      } catch (e: ApiException) {
        promise.reject(
          e.statusCode.toString(),
          e.message ?: "sign_in_failed",
          e,
        )
      }
    }
  }

  private fun buildClient(activity: Activity, webClientId: String): GoogleSignInClient {
    val gso =
      GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(webClientId)
        .requestEmail()
        .build()
    return GoogleSignIn.getClient(activity, gso)
  }
}

import { BlockEmailForm, BlockScreenHeader, BlockSocialAuth, UiText, UiView } from "@repo/worktrees-studio-ds";
import { testIds } from "@repo/worktrees-studio-shared-ids";
import type { JSX } from "react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { firebaseConfigured } from "@/lib/firebase";

export default function SignIn(): JSX.Element {
  const { busy, error, signInWithGoogle, sendEmailLink, signInDev } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const configured = firebaseConfigured();

  return (
    <UiView className="flex-1 justify-center bg-background p-6" testID="screen-sign-in">
      <BlockScreenHeader title="Sign in" subtitle={configured ? "Use your Google account or get a sign-in link by email." : "Dev mode: Firebase is not configured yet."} />
      {configured ? (
        <>
          <BlockEmailForm
            email={email}
            emailError=""
            isLoading={busy}
            buttonLabel="Email me a link"
            emailLabel="Email"
            emailPlaceholder="you@example.com"
            onChangeEmail={setEmail}
            onPressSendCode={() => void sendEmailLink(email).then(() => setSent(true))}
            emailInputTestID="sign-in-email"
            sendButtonTestID="sign-in-email-btn"
          />
          <BlockSocialAuth showDivider showGoogle dividerLabel="or" googleLabel="Continue with Google" isBusy={busy} onPressGoogle={() => void signInWithGoogle()} googleButtonTestID="sign-in-google-btn" />
          {sent && !error ? <UiText className="mt-3 text-sm text-muted">Check your inbox and open the link on this device.</UiText> : null}
        </>
      ) : (
        <BlockEmailForm
          email={email}
          emailError=""
          isLoading={false}
          buttonLabel="Continue as this user"
          emailLabel="User id (dev)"
          emailPlaceholder="ann"
          onChangeEmail={setEmail}
          onPressSendCode={() => signInDev(email || "ann")}
          emailInputTestID="sign-in-dev-uid"
          sendButtonTestID="sign-in-dev-btn"
        />
      )}
      {error ? (
        <UiText className="mt-3 text-sm text-danger" testID={testIds.home.title + "-error"}>
          {error}
        </UiText>
      ) : null}
    </UiView>
  );
}

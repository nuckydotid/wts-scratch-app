import type {
  SignInOptions,
  SignInResult,
  SignOutOptions,
} from "./WorktreesStudioGoogleSignIn.types";

export default {
  async signInAsync(_options: SignInOptions): Promise<SignInResult> {
    throw new Error("Google Sign-In is only available on Android");
  },
  async signOutAsync(_options?: SignOutOptions): Promise<void> {},
};

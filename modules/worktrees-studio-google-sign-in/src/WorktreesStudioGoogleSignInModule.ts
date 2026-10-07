import { NativeModule, requireNativeModule } from "expo";

import type {
  SignInOptions,
  SignInResult,
  SignOutOptions,
} from "./WorktreesStudioGoogleSignIn.types";

declare class WorktreesStudioGoogleSignInModule extends NativeModule<
  Record<string, never>
> {
  signInAsync(options: SignInOptions): Promise<SignInResult>;
  signOutAsync(options?: SignOutOptions): Promise<void>;
}

export default requireNativeModule<WorktreesStudioGoogleSignInModule>(
  "WorktreesStudioGoogleSignIn",
);

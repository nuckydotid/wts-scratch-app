import WorktreesStudioGoogleSignInModule from "./WorktreesStudioGoogleSignInModule";

export type {
  SignInOptions,
  SignInResult,
  SignOutOptions,
} from "./WorktreesStudioGoogleSignIn.types";

export async function signInAsync(
  options: import("./WorktreesStudioGoogleSignIn.types").SignInOptions,
): Promise<import("./WorktreesStudioGoogleSignIn.types").SignInResult> {
  return WorktreesStudioGoogleSignInModule.signInAsync(options);
}

export async function signOutAsync(
  options?: import("./WorktreesStudioGoogleSignIn.types").SignOutOptions,
): Promise<void> {
  await WorktreesStudioGoogleSignInModule.signOutAsync(options);
}

/**
 * Navigation graph shown by the flows canvas. Hand-authored sample for the template; replace it with the
 * project's own screens (or generate it from the Expo Router tree).
 */
export type ScreenCategory = "root" | "public" | "admin" | "member" | "staff" | "e2e";

export type ScreenArchetype = "layout" | "tab" | "screen" | "dynamic" | "teleport";

export type TeleportKind =
  | "tab-bar"
  | "drawer"
  | "full-sheet"
  | "bottom-sheet"
  | "toast"
  | "menu"
  | "date-picker"
  | "media-viewer";

export type ScreenCapability = "native-scan" | "native-picker" | "native-document";

export type NavigationTransitionType =
  | "push"
  | "replace"
  | "redirect"
  | "fork"
  | "tab"
  | "drawer"
  | "sheet"
  | "bottom-sheet"
  | "full-sheet"
  | "teleport";

export type ScreenNodeData = {
  id: string;
  title: string;
  route: string;
  filePath: string;
  componentName: string;
  targetModule?: string;
  category: ScreenCategory;
  type: ScreenArchetype;
  teleportKind?: TeleportKind;
  hostLayoutId?: string;
  params?: string[];
  description: string;
  parentId?: string;
  badge?: string;
  testID: string;
  testIDs?: string[];
  hostTestIDs?: string[];
  inline?: boolean;
  capabilities?: ScreenCapability[];
};

export interface ScreenEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface NavigationEdgeData {
  id: string;
  source: string;
  target: string;
  transitionType: NavigationTransitionType;
  trigger?: string;
  testID?: string;
  label?: string;
  category: ScreenCategory;
  isAuxiliary?: boolean;
  menuItem?: boolean;
  points?: { x: number; y: number }[];
  [key: string]: unknown;
}

export const SCREEN_NODES: ScreenNodeData[] = [
  {
    id: "root-layout",
    title: "Root Layout",
    route: "/_layout",
    filePath: "src/app/_layout.tsx",
    componentName: "RootLayout",
    category: "root",
    type: "layout",
    description: "Root providers and navigation stack.",
    badge: "_layout",
    testID: "screen-root-layout",
  },
  {
    id: "public-sign-in",
    title: "Sign in",
    route: "/sign-in",
    filePath: "src/app/sign-in.tsx",
    componentName: "SignInScreen",
    category: "public",
    type: "screen",
    description: "Google or email-link sign-in (Firebase Auth).",
    parentId: "root-layout",
    testID: "screen-public-sign-in",
  },
  {
    id: "member-home",
    title: "Home",
    route: "/(app)/home",
    filePath: "src/app/(app)/home.tsx",
    componentName: "HomeScreen",
    category: "member",
    type: "screen",
    description: "Signed-in landing screen.",
    parentId: "root-layout",
    testID: "screen-member-home",
  },
  {
    id: "member-chat",
    title: "Chat",
    route: "/(app)/chat",
    filePath: "src/app/(app)/chat.tsx",
    componentName: "ChatScreen",
    category: "member",
    type: "screen",
    description: "Realtime chat over the API WebSocket.",
    parentId: "root-layout",
    testID: "screen-member-chat",
  },
];

export const SCREEN_EDGES: ScreenEdgeData[] = [
  { id: "e-root-layout-public-sign-in", source: "root-layout", target: "public-sign-in" },
  { id: "e-root-layout-member-home", source: "root-layout", target: "member-home" },
  { id: "e-root-layout-member-chat", source: "root-layout", target: "member-chat" },
];

export const NAVIGATION_EDGES: NavigationEdgeData[] = [
  {
    id: "nav-public-sign-in-member-home",
    source: "public-sign-in",
    target: "member-home",
    transitionType: "replace",
    trigger: "onSignedIn",
    testID: "sign-in-btn",
    label: "Signed in",
    category: "public",
  },
  {
    id: "nav-member-home-member-chat",
    source: "member-home",
    target: "member-chat",
    transitionType: "push",
    trigger: "onPressChat",
    testID: "open-chat-btn",
    label: "Open chat",
    category: "member",
  },
];

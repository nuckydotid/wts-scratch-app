/**
 * Shared testID registry. Every interactive element gets its testID from here so Maestro/Jest flows and
 * the design canvas agree on the same names. Add a section per feature as the project grows
 * (`screen-${id}` for root anchors, `${feature}-${thing}` for controls).
 */

/** Screens of the sample app. Add an id per screen; the flows canvas and Maestro flows reference them. */
export const SCREEN_IDS = ["home"] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

/** Test-case ids look like TC-AUTH-001 and appear in jest titles and Maestro tags. */
export const TEST_CASE_ID = /^TC-[A-Z0-9]+-\d{3,}$/;
export const isTestCaseId = (s: string): boolean => TEST_CASE_ID.test(s);

export const testIds = {
  /** Root anchor of a screen: `screen-${screenId}`. */
  screen: (id: ScreenId) => `screen-${id}`,

  home: {
    title: "home-title",
    appName: "home-label-app-name",
  },

  // Flow Visual Canvas (flows/worktrees-studio)
  flow: {
    canvas: "flow-canvas",
    sidebar: "flow-sidebar",
    sidebarCategory: (category: string) => `flow-sidebar-cat-${category}`,
    searchInput: "flow-search-input",
    inspector: "flow-inspector",
    inspectorClose: "flow-inspector-close",
    inspectorCopyRoute: "flow-inspector-copy-route",
    inspectorCopyTestId: "flow-inspector-copy-testid",
    node: (id: string) => `flow-node-${id}`,
  },

  // Chat (bubbles, conversations)
  chat: {
    bubble: (id: string) => `chat-bubble-${id}`,
    conversation: (id: string) => `chat-conversation-item-${id}`,
  },

  // Attachment editor / media viewer derivations (`${prefix}-${suffix}`)
  attachment: (prefix: string, suffix: string) => `${prefix}-${suffix}`,

  // ID-card export filename
  idCard: {
    fileName: (id?: string | null) => `id-card-${id || "member"}.png`,
  },

  // Navbar overflow menus (`${scope}-more`)
  menu: {
    more: (scope: string) => `${scope}-more`,
  },
} as const;

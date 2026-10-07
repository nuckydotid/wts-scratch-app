// `./core` is copied from the Worktrees Studio repo (src/shared/design) when the template is built.
export { DesignClient } from './core/client.ts';
export type { DesignState, RemoteCursor } from './core/client.ts';
export { DESIGN_COLORS, DESIGN_LIMITS } from './core/protocol.ts';
export type { DesignChatMsg, DesignLook, DesignPeer, DesignPin, DesignPrEvent, DesignVersion, DesignView } from './core/protocol.ts';
export { renderJulesTask, taskPath } from './core/task.ts';
export { CollabProvider, designSocketUrl, useCollab, useOptionalCollab } from './CollabProvider.tsx';
export type { CollabApi, CollabProviderProps } from './CollabProvider.tsx';
export { CursorLayer } from './CursorLayer.tsx';
export { PinsLayer } from './PinsLayer.tsx';
export { FollowBanner, PresenceBar } from './PresenceBar.tsx';
export { CollabSidePanel } from './SidePanel.tsx';
export { VersionBanner } from './VersionBanner.tsx';
export { CANVAS_ZOOM_MAX, CANVAS_ZOOM_MIN, fromDesignView, pathToStory, sameSha, sameView, storyToHref, toDesignView } from './view-map.ts';
export type { CanvasTransform, Viewport } from './view-map.ts';

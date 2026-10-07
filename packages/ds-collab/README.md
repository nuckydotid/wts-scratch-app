# @repo/ds-collab

Realtime collaboration for the design-system story web: **live cursors, follow mode, group chat and pinned
comments**, plus a one-click hand-off of the comments to Jules.

`src/core/` is copied from the Worktrees Studio repo when the template is built (`src/shared/design`); the React
parts here are plain DOM + inline styles so they work inside any story layout.

## Wire it into your story web

```tsx
import { CollabProvider, CollabSidePanel, CursorLayer, FollowBanner, PinsLayer, PresenceBar, useCollab } from '@repo/ds-collab';

export function StoryApp() {
  const frame = useRef<HTMLDivElement>(null);          // the phone frame element
  const canvas = useRef<HTMLDivElement>(null);          // the scrollable/zoomable canvas
  const [story, setStory] = useStory();                 // your current story id, e.g. "button/primary"
  const user = useFirebaseUser();                       // Google sign-in on the web (same Firebase project as the API)

  return (
    <CollabProvider
      serverUrl={process.env.EXPO_PUBLIC_OFFICE_URL!}   // the Worktrees Cloud Run server
      projectId={process.env.EXPO_PUBLIC_PROJECT_ID!}   // docs/… → "projectId" in Worktrees Studio
      name={user.displayName ?? 'Guest'}
      getToken={() => user.getIdToken()}
      onFollowView={(v) => { setStory(v.story); setZoom(v.zoom); canvas.current?.scrollTo(v.sx, v.sy); }}
    >
      <header><PresenceBar onGoToStory={setStory} /></header>
      <FollowBanner canvas={canvas} />
      <div ref={canvas}>
        <div ref={frame} style={{ position: 'relative' }}>
          <PhoneFrame><CurrentStory /></PhoneFrame>
          <PinsLayer frame={frame} story={story} />
          <CursorLayer frame={frame} story={story} />
        </div>
      </div>
      <CollabSidePanel story={story} project="Pocket Garden" onGoToStory={setStory} />
      <PublishView story={story} />   {/* see below */}
    </CollabProvider>
  );
}

// Tell the others what you are looking at so they can follow you.
function PublishView({ story }: { story: string }) {
  const { client } = useCollab();
  useEffect(() => client.view({ story, zoom, sx, sy }), [story, zoom, sx, sy]);
  return null;
}
```

* Cursors and pins are stored **normalised to the story frame** (0–1), so they land in the right place at any zoom or device size.
* Following stops when the follower scrolls, clicks the canvas or presses Esc (`FollowBanner`).
* Edits to the design are still source edits (`expo-story.tsx` and the components): the room carries conversation and
  intent, and **Send to Jules** turns the open comments into a task (`renderJulesTask`). Pass `onSendToJules` to commit
  `design/tasks/…md` and start Jules; without it the task is copied to the clipboard.

## Hosting

`bash scripts/ship/deploy-design.sh` exports `packages/worktrees-studio-ds` for the web and deploys it to Firebase Hosting
(`https://<slug>-design.web.app`). Set the site address as the project's `designUrl` in Worktrees Studio so the
server accepts the site's origin on the `/design` socket. Static hosting is public: the site itself shows a sign-in,
and the realtime room only admits project members.

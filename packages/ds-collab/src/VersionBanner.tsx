import { useCollab } from './CollabProvider.tsx';
import { sameSha } from './view-map.ts';

const bar: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600 };
const btn: React.CSSProperties = { border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 700, cursor: 'pointer', background: '#10131c', color: '#fff' };

/**
 * Shows what CI announced: "a new version is live — reload" once the live site was built from a different commit than
 * this page, and a link to the preview of each open pull request. `currentSha` is the commit this page was built from
 * (`EXPO_PUBLIC_BUILD_SHA`); without it only previews are shown.
 */
export function VersionBanner({ currentSha }: { currentSha?: string }) {
  const { state } = useCollab();
  const stale = !!currentSha && !!state.live && !sameSha(state.live.sha, currentSha);
  const previews = state.previews.slice(0, 2);
  if (!stale && previews.length === 0) return null;
  return (
    <div role="status" aria-live="polite">
      {stale ? (
        <div style={{ ...bar, background: '#9ece6a', color: '#10131c' }}>
          A new version of the design site is live.
          <button type="button" style={btn} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      ) : null}
      {previews.map((p) => (
        <div key={p.url} style={{ ...bar, background: '#7aa2f7', color: '#10131c' }}>
          Preview ready{p.pr ? ` for PR #${p.pr}` : ''}.
          <a href={p.url} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>
            Open preview
          </a>
        </div>
      ))}
    </div>
  );
}

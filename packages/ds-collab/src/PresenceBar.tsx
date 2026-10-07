import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useCollab } from './CollabProvider.tsx';

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

/** Who is here. Click a face to follow them; click again to stop. */
export function PresenceBar({ onGoToStory }: { onGoToStory?: (story: string) => void }) {
  const { client, state } = useCollab();
  const peers = Object.values(state.peers);
  const dot = (bg: string, label: string, props: Record<string, unknown> = {}) => ({ style: { width: 28, height: 28, borderRadius: 14, background: bg, color: '#10131c', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', ...props } as React.CSSProperties, 'aria-label': label });
  return (
    <div role="group" aria-label="People in this design" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span title={state.status === 'online' ? 'You' : state.status} {...dot(state.status === 'online' ? state.color : '#5a6075', 'You')}>
        {state.status === 'online' ? 'You' : '…'}
      </span>
      {peers.map((p) => {
        const following = state.following === p.id;
        return (
          <button
            key={p.id}
            type="button"
            title={`${p.name}${p.story ? ` — ${p.story}` : ''}\n${following ? 'Click to stop following' : 'Click to follow'}`}
            onClick={() => {
              client.follow(following ? null : p.id);
              if (!following && p.view?.story) onGoToStory?.(p.view.story);
            }}
            {...dot(p.color, `${following ? 'Stop following' : 'Follow'} ${p.name}`, { cursor: 'pointer', outline: following ? '2px solid #fff' : 'none', outlineOffset: 2 })}
          >
            {initials(p.name)}
          </button>
        );
      })}
      {state.error ? <span role="alert" style={{ color: '#f7768e', fontSize: 12 }}>{state.error}</span> : null}
    </div>
  );
}

/** Banner shown while following; any interaction with `canvas` (or Escape) stops following. */
export function FollowBanner({ canvas }: { canvas?: RefObject<HTMLElement | null> }) {
  const { client, state } = useCollab();
  const target = state.following ? state.peers[state.following] : null;
  useEffect(() => {
    if (!state.following) return;
    const stop = () => client.follow(null);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && stop();
    const el = canvas?.current;
    el?.addEventListener('wheel', stop, { passive: true });
    el?.addEventListener('pointerdown', stop);
    window.addEventListener('keydown', key);
    return () => {
      el?.removeEventListener('wheel', stop);
      el?.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', key);
    };
  }, [client, canvas, state.following]);
  if (!target) return null;
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: target.color, color: '#10131c', fontSize: 12, fontWeight: 600 }}>
      Following {target.name}
      <button type="button" onClick={() => client.follow(null)} style={{ marginLeft: 'auto', border: 'none', background: 'rgba(0,0,0,.15)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>
        Stop (Esc)
      </button>
    </div>
  );
}

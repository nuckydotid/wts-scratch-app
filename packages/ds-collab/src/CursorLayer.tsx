import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useCollab } from './CollabProvider.tsx';

const STALE_MS = 8000;

/**
 * Sends your pointer position over `frame` (normalised to the frame, so it is correct at any zoom or device size)
 * and draws teammates' cursors for the same `story`. Render it inside the (positioned) phone frame.
 */
export function CursorLayer({ frame, story }: { frame: RefObject<HTMLElement | null>; story: string }) {
  const { client, state } = useCollab();
  const [, tick] = useState(0);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) client.cursor(story, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, [client, frame, story]);

  // Fade out cursors of people who stopped moving or went idle.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 50 }}>
      {Object.entries(state.cursors)
        .filter(([id, c]) => c.story === story && now - c.at < STALE_MS && state.peers[id])
        .map(([id, c]) => {
          const peer = state.peers[id];
          return (
            <div key={id} style={{ position: 'absolute', left: `${c.x * 100}%`, top: `${c.y * 100}%`, transition: 'left 70ms linear, top 70ms linear', willChange: 'left, top' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' }}>
                <path d="M1 1l6 15 2.2-6.2L16 7.6z" fill={peer.color} stroke="#fff" strokeWidth="1" />
              </svg>
              <span style={{ marginLeft: 12, marginTop: -2, padding: '1px 6px', borderRadius: 6, background: peer.color, color: '#10131c', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>{peer.name}</span>
            </div>
          );
        })}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useCollab } from './CollabProvider.tsx';

/**
 * Comment pins on the story frame. Turn on `pinMode` (from the side panel), click the frame, type, press Enter.
 * Pins are shared with the whole team and are what "Send to Jules" turns into a task.
 */
export function PinsLayer({ frame, story }: { frame: RefObject<HTMLElement | null>; story: string }) {
  const { client, state, pinMode, setPinMode } = useCollab();
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el || !pinMode) return;
    const click = (e: MouseEvent) => {
      // Clicks on the pins' own UI (the composer's Pin button, an open comment) are not new placements.
      if (e.target instanceof Element && e.target.closest('[data-collab-pins]')) return;
      const r = el.getBoundingClientRect();
      setDraft({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      setText('');
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('click', click, true);
    el.style.cursor = 'crosshair';
    return () => {
      el.removeEventListener('click', click, true);
      el.style.cursor = '';
    };
  }, [frame, pinMode]);

  const pins = state.pins.filter((p) => p.story === story);
  const submit = () => {
    if (draft && text.trim()) client.addPin(story, draft.x, draft.y, text.trim());
    setDraft(null);
    setText('');
    setPinMode(false);
  };

  return (
    <div data-collab-pins style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
      {pins.map((p, i) => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x * 100}%`, top: `${p.y * 100}%`, pointerEvents: 'auto' }}>
          <button
            type="button"
            aria-label={`Comment ${i + 1} by ${p.by.name}${p.resolved ? ' (resolved)' : ''}`}
            onClick={() => setOpen(open === p.id ? null : p.id)}
            style={{ transform: 'translate(-50%,-100%)', width: 24, height: 24, borderRadius: '12px 12px 12px 2px', border: '2px solid #fff', background: p.resolved ? '#5a6075' : p.by.color, color: '#10131c', fontWeight: 700, fontSize: 11, cursor: 'pointer', opacity: p.resolved ? 0.6 : 1 }}
          >
            {i + 1}
          </button>
          {open === p.id ? (
            <div style={{ position: 'absolute', left: 14, top: -8, width: 220, padding: 10, borderRadius: 10, background: '#1b1e2b', color: '#e6e8f0', fontSize: 12, boxShadow: '0 6px 24px rgba(0,0,0,.45)', zIndex: 60 }}>
              <div style={{ fontWeight: 700, color: p.by.color, marginBottom: 4 }}>{p.by.name}</div>
              <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{p.text}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button type="button" onClick={() => client.updatePin(p.id, { resolved: !p.resolved })}>{p.resolved ? 'Reopen' : 'Resolve'}</button>
                <button type="button" onClick={() => client.deletePin(p.id)}>Delete</button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {draft ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ position: 'absolute', left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, pointerEvents: 'auto', transform: 'translate(8px, 8px)', display: 'flex', gap: 6, padding: 8, borderRadius: 10, background: '#1b1e2b', boxShadow: '0 6px 24px rgba(0,0,0,.45)' }}
        >
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (setDraft(null), setPinMode(false))} placeholder="Describe the change…" maxLength={500} style={{ width: 200, fontSize: 12 }} aria-label="Comment" />
          <button type="submit" disabled={!text.trim()}>Pin</button>
        </form>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useCollab } from './CollabProvider.tsx';
import { renderJulesTask } from './core/task.ts';

export interface SidePanelProps {
  /** Current story, used to tag chat messages and "add comment". */
  story: string;
  /** Human labels for story ids, used in the generated task. */
  storyLabels?: Record<string, string>;
  project: string;
  baseSha?: string;
  onGoToStory?: (story: string) => void;
  /**
   * Called with the task markdown when someone presses "Send to Jules". Commit it, open an issue — or leave it
   * unset and the task is copied to the clipboard.
   */
  onSendToJules?: (markdown: string) => void | Promise<void>;
}

const box: React.CSSProperties = { background: '#1b1e2b', color: '#e6e8f0', fontSize: 13 };

/** Side panel: group chat, the list of comment pins, and the hand-off to Jules. */
export function CollabSidePanel({ story, storyLabels, project, baseSha, onGoToStory, onSendToJules }: SidePanelProps) {
  const { client, state, pinMode, setPinMode } = useCollab();
  const [tab, setTab] = useState<'chat' | 'comments'>('chat');
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView?.({ block: 'end' }), [state.chat.length, tab]);

  const open = state.pins.filter((p) => !p.resolved);
  const send = async () => {
    const md = renderJulesTask({ project, stories: storyLabels, pins: state.pins, chat: state.chat, baseSha, note });
    try {
      if (onSendToJules) await onSendToJules(md);
      else await navigator.clipboard.writeText(md);
      setStatus(onSendToJules ? 'Sent.' : 'Task copied to the clipboard.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not send the task.');
    }
  };

  return (
    <aside aria-label="Collaboration" style={{ ...box, width: 320, height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #2c3042' }}>
      <div role="tablist" style={{ display: 'flex' }}>
        {(['chat', 'comments'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, border: 'none', background: tab === t ? '#262a3b' : 'transparent', color: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
            {t === 'chat' ? 'Chat' : `Comments (${open.length})`}
          </button>
        ))}
      </div>

      {tab === 'chat' ? (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {state.chat.length === 0 ? <p style={{ opacity: 0.6 }}>Say hi — everyone in this design sees it.</p> : null}
            {state.chat.map((m) => (
              <p key={m.id} style={{ margin: '0 0 8px', overflowWrap: 'anywhere' }}>
                <strong style={{ color: m.color }}>{m.fromName}</strong>
                {m.story ? (
                  <button type="button" onClick={() => onGoToStory?.(m.story!)} style={{ marginLeft: 6, fontSize: 10, border: 'none', background: '#2c3042', color: 'inherit', borderRadius: 4, cursor: 'pointer' }}>{storyLabels?.[m.story] ?? m.story}</button>
                ) : null}
                <br />
                {m.text}
              </p>
            ))}
            <div ref={end} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) client.sendChat(text, story);
              setText('');
            }}
            style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #2c3042' }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" maxLength={1000} aria-label="Message" style={{ flex: 1 }} />
            <button type="submit" disabled={!text.trim()}>Send</button>
          </form>
        </>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <button type="button" onClick={() => setPinMode(!pinMode)} aria-pressed={pinMode} style={{ width: '100%', marginBottom: 10 }}>
              {pinMode ? 'Click the screen to place a comment (Esc to cancel)' : 'Add a comment on the screen'}
            </button>
            {state.pins.length === 0 ? <p style={{ opacity: 0.6 }}>No comments yet.</p> : null}
            {state.pins.map((p, i) => (
              <div key={p.id} style={{ marginBottom: 10, opacity: p.resolved ? 0.55 : 1 }}>
                <strong style={{ color: p.by.color }}>{p.by.name}</strong> ·{' '}
                <button type="button" onClick={() => onGoToStory?.(p.story)} style={{ border: 'none', background: 'none', color: '#7aa2f7', cursor: 'pointer', padding: 0 }}>{storyLabels?.[p.story] ?? p.story}</button>
                <div style={{ overflowWrap: 'anywhere', textDecoration: p.resolved ? 'line-through' : 'none' }}>{i + 1}. {p.text}</div>
                <button type="button" onClick={() => client.updatePin(p.id, { resolved: !p.resolved })} style={{ fontSize: 11 }}>{p.resolved ? 'Reopen' : 'Resolve'}</button>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, borderTop: '1px solid #2c3042', display: 'grid', gap: 6 }}>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Extra direction for Jules (optional)" maxLength={1000} aria-label="Extra direction" />
            <button type="button" onClick={() => void send()} disabled={open.length === 0} style={{ fontWeight: 700 }}>
              Send {open.length} comment{open.length === 1 ? '' : 's'} to Jules
            </button>
            {status ? <span role="status" style={{ fontSize: 12, opacity: 0.8 }}>{status}</span> : null}
          </div>
        </>
      )}
    </aside>
  );
}

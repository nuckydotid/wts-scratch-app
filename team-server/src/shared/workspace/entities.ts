// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import type { Appearance, PlayerState } from './types.ts';

export function makePlayer(p: {
  id: string;
  name: string;
  kind: PlayerState['kind'];
  x: number;
  y: number;
  look: Appearance;
  role?: string;
  agentId?: string;
  desk?: string | null;
}): PlayerState {
  return {
    id: p.id,
    kind: p.kind,
    name: p.name,
    role: p.role,
    x: p.x,
    y: p.y,
    dir: 'down',
    moving: false,
    sitting: null,
    status: 'available',
    statusText: '',
    emote: null,
    look: p.look,
    desk: p.desk ?? null,
    activity: null,
    agentId: p.agentId,
    thinking: false,
  };
}

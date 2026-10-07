// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import { dist } from './grid.ts';
import { zoneAt } from './default-map.ts';
import type { PlayerState, WorkspaceMap } from './types.ts';

/** Proximity-chat radius in tiles. */
export const NEARBY_RADIUS = 6;

/**
 * Whether `listener` can hear a `nearby` message from `speaker`.
 * Private zones are sealed: you hear only people in the same private zone, and
 * people inside a private zone are inaudible to anyone outside it.
 */
export function canHearNearby(
  map: Pick<WorkspaceMap, 'zones'>,
  speaker: Pick<PlayerState, 'x' | 'y'>,
  listener: Pick<PlayerState, 'x' | 'y'>,
): boolean {
  const zs = zoneAt(map, speaker.x, speaker.y);
  const zl = zoneAt(map, listener.x, listener.y);
  const ps = zs?.private ? zs.id : null;
  const pl = zl?.private ? zl.id : null;
  if (ps !== pl) return false;
  if (ps && pl && ps === pl) return true; // whole private room hears each other
  return dist(speaker, listener) <= NEARBY_RADIUS;
}

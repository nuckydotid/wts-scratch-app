import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { DesignClient } from './core/client.ts';
import type { DesignState } from './core/client.ts';
import type { DesignLook, DesignPeer, DesignView } from './core/protocol.ts';

export interface CollabProviderProps {
  /** Office server address: `https://…run.app` (the `/design` path is added) or a full `wss://…/design`. */
  serverUrl: string;
  projectId: string;
  /** Display name shown next to your cursor. */
  name: string;
  look?: DesignLook;
  /** Firebase ID token for the signed-in user; called on every (re)connect. */
  getToken: () => string | Promise<string>;
  /** Apply a followed teammate's story / zoom / scroll to your canvas. */
  onFollowView?: (view: DesignView, from: DesignPeer) => void;
  children: ReactNode;
}

export interface CollabApi {
  client: DesignClient;
  state: DesignState;
  /** While on, clicking the story frame drops a comment pin. */
  pinMode: boolean;
  setPinMode: (on: boolean) => void;
}

const Ctx = createContext<CollabApi | null>(null);

export function designSocketUrl(serverUrl: string): string {
  const u = new URL(serverUrl);
  u.protocol = u.protocol === 'https:' || u.protocol === 'wss:' ? 'wss:' : 'ws:';
  if (!u.pathname.endsWith('/design')) u.pathname = `${u.pathname.replace(/\/$/, '')}/design`;
  return u.toString();
}

export function CollabProvider({ serverUrl, projectId, name, look, getToken, onFollowView, children }: CollabProviderProps) {
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;
  const followRef = useRef(onFollowView);
  followRef.current = onFollowView;
  const [pinMode, setPinMode] = useState(false);

  const client = useMemo(
    () => new DesignClient({ url: designSocketUrl(serverUrl), projectId, name, look, getToken: () => tokenRef.current() }),
    // A new connection is only needed when who/where changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serverUrl, projectId, name],
  );
  useEffect(() => {
    client.connect();
    const off = client.onFollowedView((v, p) => followRef.current?.(v, p));
    return () => {
      off();
      client.close();
    };
  }, [client]);

  const state = useSyncExternalStore(client.subscribe, client.getState, client.getState);
  const api = useMemo<CollabApi>(() => ({ client, state, pinMode, setPinMode }), [client, state, pinMode]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCollab(): CollabApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCollab must be used inside <CollabProvider>');
  return c;
}

/** Like `useCollab`, but `null` outside a provider (components that also render when collaboration is off). */
export function useOptionalCollab(): CollabApi | null {
  return useContext(Ctx);
}

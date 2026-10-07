import type { Config } from './config.ts';

/** Normalise a design-site address to its origin + path, or null when it is not an acceptable https/localhost URL. */
export function parseDesignUrl(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > 300) return null;
  try {
    const u = new URL(v);
    const local = u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
    if (u.protocol !== 'https:' && !local) return null;
    if (u.username || u.password) return null;
    return `${u.origin}${u.pathname === '/' ? '' : u.pathname}`;
  } catch {
    return null;
  }
}

/**
 * True for the design site's own origin and for its Firebase Hosting preview channels
 * (`https://<site>--<channel>-<hash>.web.app` for a site `https://<site>.web.app`). Nothing else on the same
 * parent domain qualifies: the label must start with exactly `<site>--` and contain only [a-z0-9-].
 */
export function sameDesignSite(origin: string, designUrl: string | undefined): boolean {
  const site = parseDesignUrl(designUrl);
  if (!site) return false;
  let base: URL;
  let o: URL;
  try {
    base = new URL(site);
    o = new URL(origin);
  } catch {
    return false;
  }
  if (o.origin === base.origin) return true;
  if (o.protocol !== 'https:' || base.protocol !== 'https:' || o.port || base.port) return false;
  const [label, ...rest] = base.hostname.split('.');
  const parent = rest.join('.');
  if (parent !== 'web.app' && parent !== 'firebaseapp.com') return false;
  if (!o.hostname.endsWith(`.${parent}`)) return false;
  const first = o.hostname.slice(0, -(parent.length + 1));
  return first.startsWith(`${label}--`) && first.length > label.length + 2 && /^[a-z0-9-]+$/.test(first);
}

/** Browsers may open the design socket from the desktop app or the project's own design site. Non-browser clients send no Origin. */
export function designOriginAllowed(origin: string | null | undefined, cfg: Pick<Config, 'allowedOrigins' | 'designUrl'>): boolean {
  if (!origin) return true;
  if (cfg.allowedOrigins.includes('*') || cfg.allowedOrigins.includes(origin)) return true;
  return sameDesignSite(origin, cfg.designUrl);
}

/** The office socket is for the desktop app only (plus any configured origin). */
export function officeOriginAllowed(origin: string | null | undefined, cfg: Pick<Config, 'allowedOrigins'>): boolean {
  if (!origin) return true;
  return cfg.allowedOrigins.includes('*') || cfg.allowedOrigins.includes(origin);
}

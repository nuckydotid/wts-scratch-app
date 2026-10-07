import { createHash } from "node:crypto";

export interface ObjectInfo {
  key: string;
  size: number;
  /** Content hash (md5 hex), used for the asset manifest. */
  hash: string;
}

/** Object storage abstraction: Cloud Storage in production, memory in dev/tests. */
export interface ObjectStore {
  put(key: string, data: Uint8Array, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Size in bytes, or null when the object does not exist. */
  head(key: string): Promise<{ size: number } | null>;
  /** Objects under `prefix` (keys sorted). */
  list(prefix: string): Promise<ObjectInfo[]>;
  /** Time-limited read URL (V4 signed URL on GCS). */
  signedGetUrl(key: string, ttlSec: number): Promise<string>;
  /** Time-limited upload URL for direct client uploads. */
  signedPutUrl(key: string, contentType: string, ttlSec: number): Promise<string>;
}

/** Keys are server-generated, but never trust path-like input. */
export function assertSafeKey(key: string): void {
  if (!key || key.startsWith("/") || key.split("/").some((p) => p === ".." || p === "")) {
    throw new Error(`unsafe object key: ${key}`);
  }
}

export class MemoryObjectStore implements ObjectStore {
  readonly objects = new Map<string, { data: Uint8Array; contentType: string }>();
  async put(key: string, data: Uint8Array, contentType: string) {
    assertSafeKey(key);
    this.objects.set(key, { data, contentType });
  }
  async delete(key: string) {
    this.objects.delete(key);
  }
  async head(key: string) {
    const o = this.objects.get(key);
    return o ? { size: o.data.byteLength } : null;
  }
  async list(prefix: string) {
    return [...this.objects.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(([key, o]) => ({ key, size: o.data.byteLength, hash: createHash("md5").update(o.data).digest("hex") }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
  async signedGetUrl(key: string, ttlSec: number) {
    assertSafeKey(key);
    return `memory://bucket/${key}?ttl=${ttlSec}`;
  }
  async signedPutUrl(key: string, _contentType: string, ttlSec: number) {
    assertSafeKey(key);
    return `memory://bucket/${key}?upload=1&ttl=${ttlSec}`;
  }
}

export class GcsObjectStore implements ObjectStore {
  private bucketPromise: Promise<import("@google-cloud/storage").Bucket>;
  constructor(bucketName: string) {
    this.bucketPromise = import("@google-cloud/storage").then(({ Storage }) => new Storage().bucket(bucketName));
  }
  async put(key: string, data: Uint8Array, contentType: string) {
    assertSafeKey(key);
    await (await this.bucketPromise).file(key).save(Buffer.from(data), { contentType, resumable: false });
  }
  async delete(key: string) {
    assertSafeKey(key);
    await (await this.bucketPromise).file(key).delete({ ignoreNotFound: true });
  }
  async head(key: string) {
    assertSafeKey(key);
    const f = (await this.bucketPromise).file(key);
    const [exists] = await f.exists();
    if (!exists) return null;
    const [meta] = await f.getMetadata();
    return { size: Number(meta.size ?? 0) };
  }
  async list(prefix: string) {
    const [files] = await (await this.bucketPromise).getFiles({ prefix });
    return files
      .filter((f) => !f.name.endsWith("/"))
      .map((f) => ({
        key: f.name,
        size: Number(f.metadata.size ?? 0),
        hash: Buffer.from(String(f.metadata.md5Hash ?? ""), "base64").toString("hex"),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
  async signedGetUrl(key: string, ttlSec: number) {
    assertSafeKey(key);
    const [url] = await (await this.bucketPromise).file(key).getSignedUrl({ version: "v4", action: "read", expires: Date.now() + ttlSec * 1000 });
    return url;
  }
  async signedPutUrl(key: string, contentType: string, ttlSec: number) {
    assertSafeKey(key);
    const [url] = await (await this.bucketPromise)
      .file(key)
      .getSignedUrl({ version: "v4", action: "write", expires: Date.now() + ttlSec * 1000, contentType });
    return url;
  }
}

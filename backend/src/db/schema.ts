import { bigint, bigserial, boolean, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  ownerUid: text("owner_uid").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Realtime chat (WebSocket + REST). Membership is a plain list of Firebase uids per room. */
export const chatRoom = pgTable("chat_room", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
  closed: boolean("closed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMember = pgTable(
  "chat_member",
  {
    roomId: text("room_id").notNull(),
    uid: text("uid").notNull(),
    /** Highest chat_message.id this member has read (for unread counts). */
    lastReadId: bigint("last_read_id", { mode: "number" }).notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roomId, t.uid] }), index("chat_member_uid_idx").on(t.uid)],
);

/** `id` is monotonic, so it doubles as the pagination cursor and the read pointer. */
export const chatMessage = pgTable(
  "chat_message",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    roomId: text("room_id").notNull(),
    senderUid: text("sender_uid").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("chat_message_room_idx").on(t.roomId, t.id)],
);

/** One row per published OTA bundle; ids are sequential per native version. */
export const otaBundle = pgTable(
  "ota_bundle",
  {
    id: integer("id").notNull(),
    nativeId: text("native_id").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    androidKey: text("android_key"),
    iosKey: text("ios_key"),
    androidSize: bigint("android_size", { mode: "number" }),
    iosSize: bigint("ios_size", { mode: "number" }),
    androidSha256: text("android_sha256"),
    iosSha256: text("ios_sha256"),
    /** Soft-disable a bad bundle without deleting it (rollback = disable the newest). */
    disabled: boolean("disabled").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.nativeId, t.id] })],
);

export const versionPolicy = pgTable("version_policy", {
  id: integer("id").primaryKey(),
  minNativeVersion: text("min_native_version").notNull().default("1.0.0"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nativeOtaMinBundle = pgTable("native_ota_min_bundle", {
  nativeId: text("native_id").primaryKey(),
  minOtaBundleId: integer("min_ota_bundle_id").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Idempotent bootstrap DDL (the template ships without a migration runner; keep in sync with the tables above). */
export const DDL = [
  `CREATE TABLE IF NOT EXISTS items (id text PRIMARY KEY, owner_uid text NOT NULL, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS items_owner_idx ON items (owner_uid)`,
  `CREATE TABLE IF NOT EXISTS chat_room (id text PRIMARY KEY, name text NOT NULL, created_by text NOT NULL, closed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS chat_member (room_id text NOT NULL, uid text NOT NULL, last_read_id bigint NOT NULL DEFAULT 0, joined_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (room_id, uid))`,
  `CREATE INDEX IF NOT EXISTS chat_member_uid_idx ON chat_member (uid)`,
  `CREATE TABLE IF NOT EXISTS chat_message (id bigserial PRIMARY KEY, room_id text NOT NULL, sender_uid text NOT NULL, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS chat_message_room_idx ON chat_message (room_id, id)`,
  `CREATE TABLE IF NOT EXISTS ota_bundle (id integer NOT NULL, native_id text NOT NULL, published_at timestamptz NOT NULL DEFAULT now(), android_key text, ios_key text, android_size bigint, ios_size bigint, android_sha256 text, ios_sha256 text, disabled boolean NOT NULL DEFAULT false, PRIMARY KEY (native_id, id))`,
  `CREATE TABLE IF NOT EXISTS version_policy (id integer PRIMARY KEY, min_native_version text NOT NULL DEFAULT '1.0.0', updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS native_ota_min_bundle (native_id text PRIMARY KEY, min_ota_bundle_id integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now())`,
];

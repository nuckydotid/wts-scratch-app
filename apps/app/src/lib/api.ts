import { createClient } from "backend/client";
import { getIdToken } from "./auth";
import { config } from "./config";

/** Typed Hono client (`AppType` from the backend); sends the Firebase ID token on every call. */
export const api = createClient(config.api.url, getIdToken);

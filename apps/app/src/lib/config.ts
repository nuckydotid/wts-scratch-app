import Constants from "expo-constants";

/** Runtime config injected by `app.config.ts` from `project.config.json` (edit that file, not this one). */
export interface AppConfig {
  api: { url: string };
  gcp: { projectId: string; region: string };
  firebase: { apiKey: string; appId: string; webClientId: string; linkDomain: string };
  onesignal: { appId: string };
  scheme: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppConfig>;

export const config: AppConfig = {
  api: { url: extra.api?.url ?? "http://localhost:8080" },
  gcp: { projectId: extra.gcp?.projectId ?? "", region: extra.gcp?.region ?? "us-central1" },
  firebase: {
    apiKey: extra.firebase?.apiKey ?? "",
    appId: extra.firebase?.appId ?? "",
    webClientId: extra.firebase?.webClientId ?? "",
    linkDomain: extra.firebase?.linkDomain ?? "",
  },
  onesignal: { appId: extra.onesignal?.appId ?? "" },
  scheme: extra.scheme ?? "app",
};

/** `ws(s)://host/ws/chat` for the same origin as the API. */
export const chatSocketUrl = (apiUrl = config.api.url): string => `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ws/chat`;

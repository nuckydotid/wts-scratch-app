/**
 * Push notifications via OneSignal (the only non-Google service in the template). The app calls
 * `OneSignal.login(firebaseUid)`, so recipients are addressed by Firebase uid (OneSignal "external_id");
 * the server keeps no device tokens. FCM stays the transport underneath OneSignal on Android.
 */
export interface Notifier {
  /** Send to Firebase uids. `sent` = recipients accepted by OneSignal, `failed` = recipients in rejected batches. */
  send(uids: string[], title: string, body: string, data?: Record<string, string>): Promise<{ sent: number; failed: number }>;
}

/** OneSignal accepts at most 2000 external ids per request. */
const BATCH = 2000;

export class OneSignalNotifier implements Notifier {
  constructor(
    private appId: string,
    private apiKey: string,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  async send(uids: string[], title: string, body: string, data: Record<string, string> = {}) {
    let sent = 0;
    let failed = 0;
    const unique = [...new Set(uids)];
    for (let i = 0; i < unique.length; i += BATCH) {
      const batch = unique.slice(i, i + BATCH);
      try {
        const res = await this.fetchImpl("https://api.onesignal.com/notifications", {
          method: "POST",
          headers: { authorization: `Key ${this.apiKey}`, "content-type": "application/json" },
          body: JSON.stringify({
            app_id: this.appId,
            target_channel: "push",
            include_aliases: { external_id: batch },
            headings: { en: title },
            contents: { en: body },
            data,
          }),
        });
        if (res.ok) sent += batch.length;
        else failed += batch.length;
      } catch {
        failed += batch.length;
      }
    }
    return { sent, failed };
  }
}

export class NoopNotifier implements Notifier {
  readonly outbox: { uids: string[]; title: string; body: string; data?: Record<string, string> }[] = [];
  async send(uids: string[], title: string, body: string, data?: Record<string, string>) {
    this.outbox.push({ uids, title, body, data });
    return { sent: uids.length, failed: 0 };
  }
}

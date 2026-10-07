/**
 * Structured logs for Cloud Logging: one JSON object per line on stdout with `severity`.
 * Errors carry `@type: ReportedErrorEvent` + the stack in `message`, so Error Reporting groups them with no extra SDK.
 */
type Severity = "DEBUG" | "INFO" | "WARNING" | "ERROR";

const REPORTED = "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent";

export function log(severity: Severity, message: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ severity, message, ...fields }));
}

export function logError(err: unknown, fields: Record<string, unknown> = {}): void {
  const e = err instanceof Error ? err : new Error(String(err));
  console.log(
    JSON.stringify({
      severity: "ERROR",
      "@type": REPORTED,
      message: e.stack ?? e.message,
      serviceContext: { service: process.env.K_SERVICE ?? "api", version: process.env.K_REVISION ?? "dev" },
      ...fields,
    }),
  );
}

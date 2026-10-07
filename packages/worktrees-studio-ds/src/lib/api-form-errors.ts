import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ApiErrorItem = { field?: string; message?: string };

/**
 * Reads the `{ errors: [{ field, code, message }] }` payload from an
 * app-thrown `ApiError` (`e.data` — the API contract shared with the hosts).
 */
function parseErrorItems(e: unknown): ApiErrorItem[] {
  const data = (e as { data?: unknown } | null)?.data;
  if (!data || typeof data !== "object") return [];
  const errors = (data as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return [];
  return errors.filter((raw): raw is ApiErrorItem => !!raw && typeof raw === "object");
}

/**
 * Maps the FIELD errors of a server error payload onto a react-hook-form
 * instance and returns the consumed field names, so the host's error
 * handler can skip them (field errors render under their inputs — only the
 * remaining root errors toast). Unknown field names are left for toasts.
 *
 * Used by DS screens that own their sheet forms (students/teachers) — the
 * hosts never touch the form instance directly.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  form: { setError: UseFormSetError<T>; getValues: () => T },
  e: unknown
): string[] {
  const items = parseErrorItems(e);
  const values = form.getValues();
  const consumed: string[] = [];
  for (const item of items) {
    const field = item.field ?? "root";
    if (field === "root" || !(field in values)) continue;
    form.setError(field as Path<T>, { type: "server", message: item.message ?? "Error" });
    consumed.push(field);
  }
  return consumed;
}

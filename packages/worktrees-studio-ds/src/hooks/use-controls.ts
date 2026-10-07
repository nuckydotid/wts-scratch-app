import { useState, useCallback } from "react";

export type ControlDef =
  | { type: "select"; options: readonly string[]; default: string }
  | { type: "boolean"; default: boolean }
  | { type: "text"; default: string };

export type ControlValues<T extends Record<string, ControlDef>> = {
  [K in keyof T]: T[K] extends { type: "select" | "text"; default: infer D }
    ? D
    : T[K] extends { type: "boolean"; default: infer D }
      ? D
      : never;
};

export function useControls<T extends Record<string, ControlDef>>(defs: T) {
  const defaults = Object.fromEntries(
    Object.entries(defs).map(([key, def]) => [key, def.default])
  ) as ControlValues<T>;

  const [values, setValues] = useState<ControlValues<T>>(defaults);

  const set = useCallback((key: keyof T, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(defaults);
  }, [defaults]);

  return { props: values, set, reset, defs };
}

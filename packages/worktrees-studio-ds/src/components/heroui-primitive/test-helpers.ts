import { render } from "@testing-library/react-native";
import type { ComponentDef } from "../../expo-story/items/heroui-primitive";

type Props = Record<string, unknown>;

export function defaults(def: ComponentDef): Props {
  return Object.fromEntries(Object.entries(def.controls ?? {}).map(([k, v]) => [k, v.default]));
}

export function testBlockControls(block: ComponentDef, renderFn: (props: Props) => any) {
  describe(block.label, () => {
    const base = defaults(block);

    it("renders with defaults", async () => {
      await expect(render(renderFn(base))).resolves.not.toThrow();
    });

    for (const [key, control] of Object.entries(block.controls ?? {})) {
      if (control.type === "select") {
        describe(`${key} variant`, () => {
          for (const option of control.options) {
            it(`accepts "${option}"`, async () => {
              const props = { ...base, [key]: option };
              await expect(render(renderFn(props))).resolves.not.toThrow();
            });
          }
        });
      }

      if (control.type === "boolean") {
        describe(`${key} boolean`, () => {
          it("true", async () => {
            await expect(render(renderFn({ ...base, [key]: true }))).resolves.not.toThrow();
          });
          it("false", async () => {
            await expect(render(renderFn({ ...base, [key]: false }))).resolves.not.toThrow();
          });
        });
      }
    }
  });
}

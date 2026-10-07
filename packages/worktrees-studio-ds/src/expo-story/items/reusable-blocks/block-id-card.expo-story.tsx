import { BlockIdCard } from "../../../components/reusable-blocks";
import { UiView, UiText } from "../../../components";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";
import { MOCK_STUDENT_PHOTO } from "../../mock-avatar";

const ASSET_BASE = "https://worker.example.com/api/assets";

export const BlockIdCardBlock: ComponentDef = {
  label: "BlockIdCard",
  category: "reusable blocks",
  controls: {
    listState: C.select(["data", "loading", "error"], "data"),
    showPhoto: C.bool(true),
    showRows: C.bool(true),
    showBackground: C.bool(true),
    showLogo: C.bool(true),
  },
  render: (p) => {
    const state = p.listState as string;
    return (
      <UiView className="flex-1 items-center justify-center p-6 gap-3">
        <UiText className="text-lg font-bold text-foreground">BlockIdCard</UiText>
        <BlockIdCard
          retryLabel="Retry"
          retryTitle="Couldn't load"

          name="Aisyah Putri"
          photoUrl={p.showPhoto ? MOCK_STUDENT_PHOTO : null}
          rows={
            p.showRows
              ? [
                  { label: "Name", value: "Aisyah Putri" },
                  { label: "NIS", value: "20250001" },
                  { label: "NISN", value: "0123456789" },
                  { label: "Birth", value: "Ciamis, 14 August 2020" },
                ]
              : []
          }
          headerLines={["RAUDHATUL ATHFAL", "MIFTAHUL FALAH"]}
          qrValue="https://example.com/id-card?token=abcd1234"
          backgroundUrl={
            p.showBackground ? `${ASSET_BASE}/images/id-card-background.png` : undefined
          }
          logoUrl={p.showLogo ? `${ASSET_BASE}/images/logo-ra-rounded.webp` : undefined}
          seed="20250001"
          isLoading={state === "loading"}
          isError={state === "error"}
        />
      </UiView>
    );
  },
};

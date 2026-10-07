import { useCallback, useState } from "react";
import { UiView, UiButton, UiText } from "../../../components";
import { TeleportDrawerView, TeleportProvider } from "../../../components/teleport";
import type { ComponentDef } from "../heroui-primitive";

export const TeleportDrawerBlock: ComponentDef = {
  label: "TeleportDrawer",
  category: "teleport",
  controls: {},
  render: () => <DrawerPreview />,
};

function DrawerPreview() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <TeleportProvider>
      <UiView className="flex-1 items-center justify-center p-6 bg-background">
        <UiButton variant="primary" onPress={toggle}>
          {isOpen ? "Close Drawer" : "Open Drawer"}
        </UiButton>
        <UiText className="text-sm text-muted mt-4">
          Drawer slides in from the left with backdrop
        </UiText>
      </UiView>
      {isOpen && (
        <TeleportDrawerView
          config={{
            items: [
              { key: "dashboard", label: "Dashboard", icon: "grid-outline" },
              { key: "classes", label: "Classes", icon: "school-outline" },
              { key: "teachers", label: "Teachers", icon: "people-outline" },
              { key: "students", label: "Students", icon: "person-outline" },
              { key: "parents", label: "Parents", icon: "people-circle-outline" },
            ],
            userName: "Admin User",
            userEmail: "admin@school.com",
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </TeleportProvider>
  );
}

import { fireEvent, render } from "@testing-library/react-native";
import { BlockNavBar } from "../block-nav-bar";

const NAV_A11Y = {
  menuA11yLabel: "Menu",
  backA11yLabel: "Back",
  moreActionsA11yLabel: "More actions",
};

describe("BlockNavBar", () => {
  it("renders the hamburger with its testID when showHamburger", async () => {
    const onPressHamburger = jest.fn();
    const { getByTestId } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        menuA11yLabel="Menu"
        backA11yLabel="Back"
        moreActionsA11yLabel="More actions"
        title="Dashboard"
        showHamburger
        onPressHamburger={onPressHamburger}
        menuTestID="navbar-menu"
      />
    );
    await fireEvent.press(getByTestId("navbar-menu"));
    expect(onPressHamburger).toHaveBeenCalledTimes(1);
  });

  it("renders the back button with its testID when showBack", async () => {
    const onPressBack = jest.fn();
    const { getByTestId } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        title="Profil"
        showBack
        onPressBack={onPressBack}
        backTestID="navbar-back"
      />
    );
    await fireEvent.press(getByTestId("navbar-back"));
    expect(onPressBack).toHaveBeenCalledTimes(1);
  });

  it("shows the hamburger only when showHamburger is set", async () => {
    const { queryByTestId } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        title="Profil"
        showBack
        menuTestID="navbar-menu"
        backTestID="navbar-back"
      />
    );
    expect(queryByTestId("navbar-menu")).toBeNull();
    expect(queryByTestId("navbar-back")).toBeTruthy();
  });

  it("renders the three-dot menu trigger with its testID when menuItems are set", async () => {
    const { getByTestId, queryByTestId } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        menuA11yLabel="Menu"
        backA11yLabel="Back"
        moreActionsA11yLabel="More actions"
        title="Profil"
        showBack
        backTestID="navbar-back"
        menuTriggerTestID="profile-more"
        menuItems={[{ key: "photo", label: "Change Profile Picture", onPress: () => {} }]}
      />
    );
    expect(getByTestId("profile-more")).toBeTruthy();
    expect(queryByTestId("navbar-back")).toBeTruthy();
  });

  it("does not render the menu trigger without menuItems", async () => {
    const { queryByTestId } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        menuA11yLabel="Menu"
        backA11yLabel="Back"
        moreActionsA11yLabel="More actions"
        title="Profil"
        showBack
        backTestID="navbar-back"
        menuTriggerTestID="profile-more"
      />
    );
    expect(queryByTestId("profile-more")).toBeNull();
  });

  it("renders the bar as a borderless card surface", async () => {
    const r = await render(
      <BlockNavBar
        {...NAV_A11Y}
        menuA11yLabel="Menu"
        backA11yLabel="Back"
        moreActionsA11yLabel="More actions"
        title="Profil"
        showBack
        backTestID="navbar-back"
      />
    );
    const json = JSON.stringify(r.toJSON());
    expect(json).toContain("bg-surface");
    expect(json).toContain("shadow-overlay");
    expect(json).not.toContain("border-b");
    expect(json).not.toContain("border-separator");
  });

  it("renders subtitle and headerTestID when provided", async () => {
    const { getByTestId, getByText } = await render(
      <BlockNavBar
        {...NAV_A11Y}
        title="Grup Diskusi"
        subtitle="12 Anggota"
        headerTestID="chat-room-header"
      />
    );
    expect(getByTestId("chat-room-header")).toBeTruthy();
    expect(getByText("Grup Diskusi")).toBeTruthy();
    expect(getByText("12 Anggota")).toBeTruthy();
  });
});

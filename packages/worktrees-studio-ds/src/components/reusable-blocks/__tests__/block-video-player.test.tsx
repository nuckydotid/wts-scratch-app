import { act, fireEvent, render } from "@testing-library/react-native";
import { BlockVideoPlayer } from "../block-video-player";

describe("BlockVideoPlayer", () => {
  it("renders the video surface with the given testID", async () => {
    const { getByTestId } = await render(
      <BlockVideoPlayer uri="https://cdn.example.com/a.mp4" testID="video-player" />
    );
    expect(getByTestId("video-player")).toBeTruthy();
  });

  it("loops and autoplays (school parity: loop=true + play on load)", async () => {
    const useVideoPlayer = jest.requireMock("expo-video").useVideoPlayer;
    await render(<BlockVideoPlayer uri="https://cdn.example.com/a.mp4" testID="video-player" />);
    const player = useVideoPlayer.mock.results.at(-1).value;
    expect(player.loop).toBe(true);
    expect(player.play).toHaveBeenCalled();
    expect(player.playing).toBe(true);
  });

  it("pauses on touch and resumes on a second touch (school parity)", async () => {
    const useVideoPlayer = jest.requireMock("expo-video").useVideoPlayer;
    const { getByTestId } = await render(
      <BlockVideoPlayer uri="https://cdn.example.com/a.mp4" testID="video-player" />
    );
    const player = useVideoPlayer.mock.results.at(-1).value;
    player.pause.mockClear();
    player.play.mockClear();

    await act(async () => {
      await fireEvent.press(getByTestId("video-player"));
    });
    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.playing).toBe(false);

    await act(async () => {
      await fireEvent.press(getByTestId("video-player"));
    });
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.playing).toBe(true);
  });

  it("renders the fullscreen FAB and fires onPressFullscreen when pressed", async () => {
    const onPressFullscreen = jest.fn();
    const { getByTestId } = await render(
      <BlockVideoPlayer
        uri="https://cdn.example.com/a.mp4"
        testID="video-player"
        onPressFullscreen={onPressFullscreen}
      />
    );
    await act(async () => {});
    expect(getByTestId("video-player-fullscreen")).toBeTruthy();
    await act(async () => {
      await fireEvent.press(getByTestId("video-player-fullscreen"));
    });
    expect(onPressFullscreen).toHaveBeenCalledTimes(1);
  });

  it("hides the fullscreen FAB when showFullscreenFab is false", async () => {
    const { queryByTestId } = await render(
      <BlockVideoPlayer
        uri="https://cdn.example.com/a.mp4"
        testID="video-player"
        showFullscreenFab={false}
      />
    );
    expect(queryByTestId("video-player-fullscreen")).toBeNull();
  });
});

/* eslint-disable @typescript-eslint/no-require-imports, react/display-name */
(globalThis as { __DEV__?: boolean }).__DEV__ = false;

// Set default test timeout for async assertions on CI runners
jest.setTimeout(20000);

// ── Mock block-line-chart-dom (DOM component for native/Jest) ──
jest.mock("./components/reusable-blocks/block-line-chart-dom", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View testID="block-line-chart-dom" {...props} />,
  };
});

// ── Mock react-native-worklets ──────────────────────
jest.mock("react-native-worklets", () => ({
  createWorklet: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
  runOnJS: (fn: any) => fn,
  createSerializable: (fn: any) => fn as any,
  makeShareableClone: (fn: any) => fn,
  makeShareableCloneRecursive: (fn: any) => fn,
}));

// ── Mock react-native-reanimated entirely ──────────
jest.mock("react-native-reanimated", () => {
  const { View, Text, Image, ScrollView } = require("react-native");

  const entryAnim = () => {
    const fn: any = () => entryAnim();
    Object.assign(fn, {
      duration: () => entryAnim(),
      springify: () => entryAnim(),
      withInitialValues: () => entryAnim(),
      easing: () => entryAnim(),
      mass: () => entryAnim(),
      stiffness: () => entryAnim(),
      damping: () => entryAnim(),
      dampingRatio: () => entryAnim(),
      overshootClamping: () => entryAnim(),
      restDisplacementThreshold: () => entryAnim(),
      restSpeedThreshold: () => entryAnim(),
      delay: () => entryAnim(),
      reduceMotion: () => entryAnim(),
    });
    return fn;
  };
  const ANIMATIONS = [
    "FadeIn",
    "FadeInDown",
    "FadeInUp",
    "FadeOut",
    "FadeOutDown",
    "FadeOutUp",
    "SlideInDown",
    "SlideInUp",
    "SlideOutDown",
    "SlideOutUp",
    "ZoomIn",
    "ZoomOut",
    "BounceIn",
    "BounceOut",
    "StretchIn",
    "StretchOut",
    "FlipInXDown",
    "FlipOutXDown",
  ];
  const entries = Object.fromEntries(ANIMATIONS.map((n) => [n, entryAnim()]));

  const Animated = {
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: (comp: any) => comp,
    useSharedValue: (init: any) => ({ value: init, set: () => {} }),
    useDerivedValue: (cb: any) => ({ value: cb() }),
    useAnimatedStyle: (cb: any) => cb(),
    useAnimatedProps: (cb: any) => cb(),
    useAnimatedScrollHandler: (cb: any) => cb,
    runOnJS: (fn: any) => fn,
    withTiming: (val: any) => val,
    withSpring: (val: any) => val,
    withRepeat: (val: any) => val,
    withSequence: (...vals: any[]) => vals.at(-1),
    Easing: { out: () => {}, in: () => {}, inOut: () => {}, linear: () => {}, bezier: () => {} },
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    interpolate: (val: any, input: any[], output: any[]) => output[0],
    Keyframe: function () {
      return { duration: () => ({ easing: () => {} }) };
    },
    Layout: { springify: () => ({}) },
    LinearTransition: { springify: () => ({}) },
    ...entries,
    default: View,
  };
  Animated.default = Animated;
  return Animated;
});

// ── Mock heroui-native components (avoid native deps) ─
jest.mock("heroui-native/text", () => {
  const { Text } = require("react-native");
  const Typography = ({ children, ...props }: any) => {
    const { type, align, color, weight, truncate, style, ...rest } = props;
    return (
      <Text style={[{ fontFamily: "mock" }, style]} {...rest}>
        {children}
      </Text>
    );
  };
  Typography.Heading = Typography;
  Typography.Paragraph = Typography;
  Typography.Code = Typography;
  return { Typography, default: Typography };
});

jest.mock("heroui-native/accordion", () => {
  const Accordion = ({ children }: any) => children;
  Accordion.Item = ({ children }: any) => children;
  Accordion.Trigger = ({ children }: any) => children;
  Accordion.Indicator = () => null;
  Accordion.Content = ({ children }: any) => children;
  return { Accordion, default: Accordion };
});

jest.mock("heroui-native/button", () => {
  const { Text, Pressable } = require("react-native");
  const Button = ({ children, ...props }: any) => (
    <Pressable {...props} accessibilityRole="button">
      <Text>{children}</Text>
    </Pressable>
  );
  Button.Label = ({ children }: any) => <Text>{children}</Text>;
  return { Button, default: Button };
});

jest.mock("heroui-native/checkbox", () => {
  const { Pressable } = require("react-native");
  const Checkbox = ({ children, isSelected, onSelectedChange, ...props }: any) => (
    <Pressable
      {...props}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      onPress={() => onSelectedChange?.(!isSelected)}
    >
      {typeof children === "function" ? children({ isSelected }) : children}
    </Pressable>
  );
  return { Checkbox, useCheckbox: () => ({}), default: Checkbox };
});

jest.mock("heroui-native/chip", () => {
  const { View, Text } = require("react-native");
  // Label must wrap in <Text>: bare strings inside the real Chip would
  // otherwise crash RN's "text must be within a <Text>" invariant.
  const Chip = ({ children }: any) => <View>{children}</View>;
  Chip.Label = ({ children }: any) => <Text>{children}</Text>;
  return { Chip, default: Chip };
});

jest.mock("heroui-native/card", () => {
  const Card = ({ children }: any) => children;
  Card.Header = ({ children }: any) => children;
  Card.Title = ({ children }: any) => children;
  Card.Description = ({ children }: any) => children;
  Card.Body = ({ children }: any) => children;
  Card.Footer = ({ children }: any) => children;
  return { Card, default: Card };
});

jest.mock("heroui-native/close-button", () => {
  const { Pressable } = require("react-native");
  const CloseButton = (props: any) => <Pressable {...props} />;
  return { CloseButton, default: CloseButton };
});

jest.mock("heroui-native/list-group", () => {
  const ListGroup = ({ children }: any) => children;
  ListGroup.Item = ({ children }: any) => children;
  ListGroup.ItemPrefix = ({ children }: any) => children;
  ListGroup.ItemContent = ({ children }: any) => children;
  ListGroup.ItemTitle = ({ children }: any) => children;
  ListGroup.ItemDescription = ({ children }: any) => children;
  return { ListGroup, default: ListGroup };
});

jest.mock("heroui-native/radio", () => {
  const { Pressable } = require("react-native");
  const Radio = (props: any) => <Pressable {...props} />;
  Radio.Indicator = () => null;
  return { Radio, default: Radio };
});

jest.mock("heroui-native/radio-group", () => {
  const { View, Pressable } = require("react-native");
  const React = require("react");
  const RadioGroupContext = React.createContext(null);
  const RadioGroup = ({ children, value, onValueChange, isDisabled = false, ...rest }: any) => {
    const contextValue = React.useMemo(
      () => ({ value, onValueChange, isDisabled }),
      [value, onValueChange, isDisabled]
    );
    return (
      <RadioGroupContext value={contextValue}>
        <View {...rest}>{children}</View>
      </RadioGroupContext>
    );
  };
  const RadioGroupItem = ({
    children,
    value: itemValue,
    onPress,
    isDisabled: itemDisabled,
    ...rest
  }: any) => {
    const ctx = React.useContext(RadioGroupContext);
    return (
      <Pressable
        {...rest}
        role="radio"
        accessibilityState={{
          disabled: Boolean(ctx?.isDisabled || itemDisabled),
          checked: ctx?.value === itemValue,
        }}
        onPress={(ev: any) => {
          if (ctx?.isDisabled || itemDisabled) return;
          ctx?.onValueChange?.(itemValue);
          onPress?.(ev);
        }}
      >
        {children}
      </Pressable>
    );
  };
  RadioGroup.Item = RadioGroupItem;
  return { RadioGroup, default: RadioGroup };
});

jest.mock("heroui-native/search-field", () => {
  const SearchField = ({ children }: any) => children;
  SearchField.Group = ({ children }: any) => children;
  SearchField.SearchIcon = () => null;
  SearchField.Input = ({ placeholder }: any) => null;
  SearchField.ClearButton = () => null;
  return { SearchField, default: SearchField };
});

jest.mock("heroui-native/slider", () => {
  const Slider = ({ children }: any) => children;
  Slider.Track = ({ children }: any) => children;
  Slider.Fill = () => null;
  Slider.Thumb = () => null;
  return { Slider, default: Slider };
});

jest.mock("heroui-native/tabs", () => {
  const Tabs = ({ children }: any) => children;
  Tabs.List = ({ children }: any) => children;
  Tabs.Trigger = ({ children }: any) => children;
  Tabs.Label = ({ children }: any) => children;
  Tabs.Indicator = () => null;
  Tabs.Content = ({ children }: any) => children;
  return { Tabs, default: Tabs };
});

jest.mock("heroui-native/tag-group", () => {
  const TagGroup = ({ children }: any) => children;
  TagGroup.List = ({ children }: any) => children;
  TagGroup.Item = ({ children }: any) => children;
  TagGroup.ItemLabel = ({ children }: any) => children;
  return { TagGroup, default: TagGroup };
});

jest.mock("heroui-native/alert", () => {
  const { View } = require("react-native");
  const Alert = ({ children }: any) => <View>{children}</View>;
  Alert.Content = ({ children }: any) => children;
  Alert.Title = ({ children }: any) => children;
  Alert.Description = ({ children }: any) => children;
  Alert.Indicator = () => null;
  return { Alert, default: Alert };
});

jest.mock("heroui-native/avatar", () => {
  const { View } = require("react-native");
  const Avatar = ({ children }: any) => <View>{children}</View>;
  Avatar.Fallback = ({ children }: any) => children;
  return { Avatar, default: Avatar };
});

jest.mock("heroui-native/control-field", () => {
  const { Pressable } = require("react-native");
  const ControlField = (props: any) => <Pressable {...props} />;
  ControlField.Indicator = () => null;
  return { ControlField, default: ControlField };
});

jest.mock("heroui-native/description", () => {
  const { Text } = require("react-native");
  const Description = (props: any) => <Text {...props} />;
  return { Description, default: Description };
});

jest.mock("heroui-native/field-error", () => {
  const { Text } = require("react-native");
  const FieldError = (props: any) => <Text {...props} />;
  return { FieldError, default: FieldError };
});

jest.mock("heroui-native/switch", () => {
  const { Switch: RNSwitch } = require("react-native");
  const Switch = (props: any) => <RNSwitch {...props} />;
  return { Switch, default: Switch };
});

jest.mock("heroui-native/input", () => {
  const { TextInput } = require("react-native");
  const Input = (props: any) => <TextInput {...props} />;
  return { Input, default: Input };
});

jest.mock("heroui-native/label", () => {
  const { Text } = require("react-native");
  const Label = (props: any) => <Text {...props} />;
  return { Label, default: Label };
});

jest.mock("heroui-native/surface", () => {
  const { View } = require("react-native");
  const Surface = (props: any) => <View {...props} />;
  return { Surface, default: Surface };
});

jest.mock("heroui-native/skeleton", () => {
  const { View } = require("react-native");
  const Skeleton = (props: any) => <View {...props} />;
  return { Skeleton, default: Skeleton };
});

jest.mock("heroui-native/separator", () => {
  const { View } = require("react-native");
  return { Separator: View, default: View };
});

jest.mock("heroui-native/spinner", () => {
  const { View } = require("react-native");
  const Spinner = (props: any) => <View {...props} />;
  return { Spinner, default: Spinner };
});

jest.mock("heroui-native/text-area", () => {
  const { TextInput } = require("react-native");
  return { TextArea: TextInput, default: TextInput };
});

jest.mock("heroui-native/text-field", () => {
  const { View } = require("react-native");
  const TextField = (props: any) => <View {...props} />;
  return { TextField, default: TextField };
});

jest.mock("heroui-native/link-button", () => {
  const { Text } = require("react-native");
  const LinkButton = (props: any) => <Text {...props} />;
  return { LinkButton, default: LinkButton };
});

// ── Mock @expo-google-fonts/* (ESM-only packages) ─────
jest.mock("@expo-google-fonts/poppins", () => ({
  useFonts: () => [true],
  Poppins_400Regular: null,
  Poppins_500Medium: null,
  Poppins_600SemiBold: null,
  Poppins_700Bold: null,
}));

jest.mock("@expo-google-fonts/roboto", () => ({
  useFonts: () => [true],
  Roboto_400Regular: null,
  Roboto_500Medium: null,
  Roboto_600SemiBold: null,
  Roboto_700Bold: null,
}));

jest.mock("@expo-google-fonts/plus-jakarta-sans", () => ({
  useFonts: () => [true],
  PlusJakartaSans_400Regular: null,
  PlusJakartaSans_500Medium: null,
  PlusJakartaSans_600SemiBold: null,
  PlusJakartaSans_700Bold: null,
}));

jest.mock("@expo-google-fonts/nunito-sans", () => ({
  useFonts: () => [true],
  NunitoSans_400Regular: null,
  NunitoSans_500Medium: null,
  NunitoSans_600SemiBold: null,
  NunitoSans_700Bold: null,
}));

// ── Mock uniwind ────────────────────────────────────
jest.mock("uniwind", () => ({
  __esModule: true,
  default: {},
  Uniwind: { setTheme: jest.fn() },
  ScopedTheme: ({ children }: { children: React.ReactNode }) => children,
  withUniwind: (Component: any) => Component,
  useCSSVariable: () => "#000000",
}));

// ── Mock RN dev-server (expo async-require chain) ────
jest.mock("react-native/Libraries/Core/Devtools/getDevServer", () => ({
  __esModule: true,
  default: () => ({
    url: "http://localhost:8081/",
    fullBundleUrl: null,
    bundleLoadedFromServer: false,
  }),
}));

// ── Mock expo async-require message socket (dev-only infra) ──
jest.mock("expo/src/async-require/messageSocket.native", () => ({}));
jest.mock("expo/src/async-require/messageSocket", () => ({}));

// ── Mock react-native-keyboard-controller ───────────
jest.mock("react-native-keyboard-controller", () => {
  const { View } = require("react-native");
  return {
    KeyboardAwareScrollView: View,
    KeyboardStickyView: View,
    KeyboardAvoidingView: View,
    useReanimatedKeyboardAnimation: () => ({
      height: { value: 0 },
      progress: { value: 0 },
    }),
  };
});

// ── Mock react-native-safe-area-context ─────────────
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

// ── Mock react-native-teleport ───────────────────────
jest.mock("react-native-teleport", () => ({
  PortalProvider: ({ children }: any) => children,
  PortalHost: () => null,
  Portal: ({ children }: any) => children,
}));

// ── Mock react-native-gesture-handler ────────────────
jest.mock("react-native-gesture-handler", () => {
  const { View } = require("react-native");
  const gesture = () => {
    const base: Record<string, unknown> = {};
    const make = () =>
      new Proxy(base, {
        get: (_, prop) => {
          if (typeof prop !== "string") return undefined;
          return (...args: unknown[]) => {
            base[prop] = args;
            return make();
          };
        },
      });
    return make();
  };
  return {
    __esModule: true,
    default: View,
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Pan: gesture,
      Pinch: gesture,
      Tap: gesture,
      LongPress: gesture,
      Rotation: gesture,
      Fling: gesture,
      Native: gesture,
      Race: (...gs: any[]) => gs[0],
      Simultaneous: (...gs: any[]) => gs[0],
      Exclusive: (...gs: any[]) => gs[0],
      compose: (...gs: any[]) => gs[0],
    },
    Directions: {},
    State: { BEGAN: 0, ACTIVE: 1, END: 2, CANCELLED: 3 },
    gestureHandlerRootHOC: (Comp: any) => Comp,
  };
});

// ── Mock expo-image ──────────────────────────────────
jest.mock("expo-image", () => ({ Image: "Image" }));

// ── Mock expo-image-manipulator ──────────────────────
const mockSaveAsync = jest.fn(async () => ({
  uri: "file://cropped.jpg",
  width: 300,
  height: 400,
  base64: "abc",
}));
const mockRenderAsync = jest.fn(async () => ({
  width: 300,
  height: 400,
  saveAsync: mockSaveAsync,
}));
const mockCrop = jest.fn().mockReturnThis();
const mockResize = jest.fn().mockReturnThis();
const mockContext = {
  crop: mockCrop,
  resize: mockResize,
  renderAsync: mockRenderAsync,
};
const mockManipulate = jest.fn(() => mockContext);

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: {
    manipulate: mockManipulate,
  },
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg", PNG: "png", WEBP: "webp" },
}));

// ── Mock expo-image-picker ───────────────────────────
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  launchImageLibraryAsync: jest.fn(),
}));

// ── Mock expo-font ───────────────────────────────────
jest.mock("expo-font", () => ({ loadAsync: jest.fn() }));

// ── Mock expo-constants ─────────────────────────────
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoVersion: "57.0.0",
    statusBarHeight: 0,
    manifest: {},
  },
}));

// ── Mock @expo/vector-icons ─────────────────────────
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: any) => <Text {...props}>{props.name}</Text>,
  };
});
jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = require("react-native");
  const MockIonicons = (props: any) => <Text {...props}>{props.name}</Text>;
  MockIonicons.glyphMap = {};
  return MockIonicons;
});

// ── Mock expo-video (native video player) ───────────
jest.mock("expo-video", () => {
  const React = require("react");
  const { View } = require("react-native");
  const VideoView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      enterFullscreen: jest.fn(),
      exitFullscreen: jest.fn(),
    }));
    return <View {...props} />;
  });
  return {
    VideoView,
    useVideoPlayer: jest.fn((_source: unknown, setup?: (p: any) => void) => {
      const state = { playing: false };
      const player = {
        get playing() {
          return state.playing;
        },
        play: jest.fn(() => {
          state.playing = true;
        }),
        pause: jest.fn(() => {
          state.playing = false;
        }),
        replace: jest.fn(),
        loop: false,
      };
      setup?.(player);
      return player;
    }),
    VideoPlayerEvents: {},
  };
});

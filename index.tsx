import React from "react";
import {
  Animated,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useKeyboardHeight } from "./useKeyboardHeight";

type ToastType = "success" | "error";
type Toast = {
  type: ToastType;
  message: string;
  id: string;
};

export type ToastConfig = {
  successStyle?: ViewStyle;
  errorStyle?: ViewStyle;
  textStyle?: ViewStyle;
  duration?: number;
};

let i = 0;

let _subscriber: ((type: ToastType, message: string) => void) | undefined =
  undefined;

const ToastItem = ({
  onClose,
  toast,
  config,
}: {
  toast: Toast;
  onClose?: (id: string) => void;
  config?: ToastConfig;
}) => {
  console.log("render toast", toast.id);
  const animation = React.useRef(new Animated.Value(0)).current;
  const timeoutId = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const startAnimation = (value: number, cb?: () => void) => {
    if (!value && timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    const a = Animated.timing(animation, {
      toValue: value,
      useNativeDriver: true,
      duration: config?.duration || 300,
    });
    a.start(() => {
      cb?.();
    });
    return a;
  };

  React.useEffect(() => {
    startAnimation(1, () => {
      timeoutId.current = setTimeout(() => {
        startAnimation(0, () => {
          onClose?.(toast.id);
        });
      }, 2000);
    });
  }, []);

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // const translateY = animation.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [-200, 0],
  // });

  const animatedStyle = {
    opacity,
    // transform: [
    //   {
    //     translateY,
    //   },
    // ],
  };
  const toastStyle =
    toast.type === "success"
      ? [styles.success, config?.successStyle]
      : [styles.error, config?.errorStyle];
  const { width } = useWindowDimensions();
  return (
    <Animated.View
      style={[
        styles.container,
        { minWidth: width / 2 },
        toastStyle,
        animatedStyle,
      ]}
    >
      <Text style={[styles.message, config?.textStyle]}>{toast.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    padding: 16,
    backgroundColor: "red",
    alignSelf: "center",
  },
  message: {
    color: "#FFF",
  },
  success: {
    backgroundColor: "#0065FF",
  },
  error: {
    backgroundColor: "#FF2738",
  },
});

export const Provider = ({ config }: { config?: ToastConfig }) => {
  const { bottom } = useSafeAreaInsets();

  const [data, setData] = React.useState<Toast[]>([]);
  const keyboardHeight = useKeyboardHeight();
  React.useEffect(() => {
    _subscriber = (type: ToastType, message: string) => {
      setData((state) => [...state, { type, message, id: String(i++) }]);
    };
    return () => {
      _subscriber = undefined;
    };
  }, []);

  const onRemove = (id: string) => {
    setData((state) => state.filter((d) => d.id !== id));
  };
  const style: ViewStyle = {
    elevation: 1,
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "column-reverse",
    bottom: bottom + keyboardHeight + 16,
  };
  return (
    <View pointerEvents="none" style={style}>
      {data.map((d) => {
        return (
          <ToastItem config={config} key={d.id} onClose={onRemove} toast={d} />
        );
      })}
    </View>
  );
};

export default {
  Provider: ({ config }: { config?: ToastConfig }) => (
    <SafeAreaProvider>
      <Provider {...{ config }} />
    </SafeAreaProvider>
  ),
  showSuccess: (message: string) => {
    _subscriber?.("success", message);
  },
  showError: (message: string) => {
    _subscriber?.("error", message);
  },
};

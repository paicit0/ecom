import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type AnimatedLoadingIndicatorProp = {
  loading: boolean;
  loadingEndPosition?: number;
  loadingStartPosition?: number;
};

const AnimatedLoadingIndicator = ({
  loading,
  loadingStartPosition = 20,
  loadingEndPosition = -100,
}: AnimatedLoadingIndicatorProp) => {
  const position = useSharedValue(loadingEndPosition);

  useEffect(() => {
    position.value = loading
      ? withTiming(loadingStartPosition, { duration: 500 })
      : withTiming(loadingEndPosition, { duration: 500 });
  }, [loading]);

  const animatedLoadingIndicatorStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: position.value }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedLoadingIndicatorStyles,
      ]}
    >
      <ActivityIndicator size="large" color="green" />
    </Animated.View>
  );
};

export default AnimatedLoadingIndicator;

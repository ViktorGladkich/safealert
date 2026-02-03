import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  interpolateColor,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export enum AlarmType {
  NORMAL = "normal",
  SILENT = "silent",
}

interface SosButtonProps {
  onAlarm: (type: AlarmType) => void;
}

const TOTAL_DURATION = 6000; // 6 seconds total
const NORMAL_THRESHOLD = 3000; // 3 seconds for normal alarm (50%)

export default function SosButton({ onAlarm }: SosButtonProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const triggerAlarm = useCallback(
    (type: AlarmType) => {
      if (type === AlarmType.NORMAL) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onAlarm(type);
    },
    [onAlarm],
  );

  const longPress = Gesture.LongPress()
    .minDuration(100)
    .onStart(() => {
      progress.value = withTiming(1, {
        duration: TOTAL_DURATION,
        easing: Easing.linear,
      });
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 100 }),
          withTiming(1.0, { duration: 100 }),
        ),
        -1,
      );
    })
    .onFinalize(() => {
      const currentProgress = progress.value * TOTAL_DURATION;

      cancelAnimation(progress);
      cancelAnimation(scale);

      if (currentProgress >= TOTAL_DURATION) {
        runOnJS(triggerAlarm)(AlarmType.SILENT);
      } else if (currentProgress >= NORMAL_THRESHOLD) {
        runOnJS(triggerAlarm)(AlarmType.NORMAL);
      }

      progress.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isSilentZone = progress.value > 0.8;
    const isNormalZone = progress.value > 0.5;

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ["#D32F2F", "#C62828", "#4A148C"], // Red -> Dark Red -> Purple
    );

    const shadowColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#D32F2F", "#9C27B0"],
    );

    return {
      transform: [{ scale: scale.value + progress.value * 0.4 }], // Grow up to 1.4x
      backgroundColor,
      shadowColor,
      shadowOpacity: 0.8,
      shadowRadius: isSilentZone ? 60 : 40,
      elevation: 20,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(progress.value > 0 ? 1 : 0.8),
    };
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={longPress}>
        <Animated.View style={[styles.button, animatedStyle]}>
          <Animated.Text style={[styles.text, textStyle]}>SOS</Animated.Text>
          <Animated.Text style={styles.subText}>GEDRÜCKT HALTEN</Animated.Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: "white",
    fontSize: 64,
    fontWeight: "bold",
  },
  subText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 2,
  },
});

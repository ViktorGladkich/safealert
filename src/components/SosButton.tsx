import React, { useCallback, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedReaction,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export enum AlarmType {
  NORMAL = "normal",
  SILENT = "silent",
}

interface SosButtonProps {
  onAlarm: (type: AlarmType) => void;
}

const TOTAL_DURATION = 1500; // 1.5 seconds triggered immediately
const BUTTON_SIZE = 240;
const RADIUS = BUTTON_SIZE / 2 + 10; // Ring slightly larger than button
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SosButton({ onAlarm }: SosButtonProps) {
  const progress = useSharedValue(0);
  const [triggered, setTriggered] = useState(false);

  const triggerAlarm = useCallback(async () => {
    if (triggered) return;
    setTriggered(true);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Play Siren Sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/siren.mp3"),
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }

    onAlarm(AlarmType.NORMAL);
  }, [onAlarm, triggered]);

  // Watch for progress completion in real-time
  useAnimatedReaction(
    () => {
      return progress.value >= 1;
    },
    (isFinished) => {
      if (isFinished) {
        runOnJS(triggerAlarm)();
      }
    },
  );

  const longPress = Gesture.LongPress()
    .minDuration(100)
    .onStart(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium); // Vibrate on press start
      runOnJS(setTriggered)(false);
      progress.value = withTiming(1, {
        duration: TOTAL_DURATION,
        easing: Easing.linear,
      });
    })
    .onFinalize(() => {
      // If released early or finished, reset animation
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 300 });
    });

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 1 }], // No scaling
      backgroundColor: "#D32F2F", // Always Red
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg
          width={(RADIUS + STROKE_WIDTH) * 2}
          height={(RADIUS + STROKE_WIDTH) * 2}
          viewBox={`0 0 ${(RADIUS + STROKE_WIDTH) * 2} ${(RADIUS + STROKE_WIDTH) * 2}`}
        >
          {/* Background Ring (Optional) */}
          <Circle
            cx={RADIUS + STROKE_WIDTH}
            cy={RADIUS + STROKE_WIDTH}
            r={RADIUS}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={RADIUS + STROKE_WIDTH}
            cy={RADIUS + STROKE_WIDTH}
            r={RADIUS}
            stroke="#FF5252"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RADIUS + STROKE_WIDTH}, ${RADIUS + STROKE_WIDTH}`}
          />
        </Svg>
      </View>

      <GestureDetector gesture={longPress}>
        <Animated.View style={[styles.button, buttonStyle]}>
          <Animated.Text style={styles.text}>SOS</Animated.Text>
          <Animated.Text style={styles.subText}>HALTEN</Animated.Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: (RADIUS + STROKE_WIDTH) * 2,
    height: (RADIUS + STROKE_WIDTH) * 2,
  },
  ringContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  text: {
    color: "white",
    fontSize: 64,
    fontWeight: "bold",
  },
  subText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: "600",
  },
});

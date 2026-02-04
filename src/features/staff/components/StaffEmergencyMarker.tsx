import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Marker } from "react-native-maps";

interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  status: "new" | "accepted" | "resolved";
  clientName?: string;
  type?: "normal" | "silent";
}

interface StaffEmergencyMarkerProps {
  emergency: Emergency;
  onPress: (e: any) => void;
}

const PulsingMarker = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.pulsingMarker,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

export default function StaffEmergencyMarker({
  emergency,
  onPress,
}: StaffEmergencyMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: emergency.latitude,
        longitude: emergency.longitude,
      }}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View
          style={[
            styles.markerCircle,
            emergency.status === "accepted"
              ? styles.markerAccepted
              : styles.markerNew,
          ]}
        >
          {emergency.status === "new" && <PulsingMarker />}
          <Ionicons
            name={emergency.type === "silent" ? "mic-off" : "alert"}
            size={20}
            color="white"
          />
        </View>
        <View style={styles.markerLabel}>
          <Text style={styles.markerLabelText}>{emergency.clientName}</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerNew: {
    backgroundColor: "#DC2626",
  },
  markerAccepted: {
    backgroundColor: "#EAB308",
  },
  markerLabel: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    opacity: 0.9,
  },
  markerLabelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  pulsingMarker: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "red",
    borderRadius: 999,
  },
});

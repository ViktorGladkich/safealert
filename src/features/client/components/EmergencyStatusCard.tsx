import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { branding } from "../../../config/branding";

interface EmergencyStatusCardProps {
  activeEmergencyId: string | null;
  emergencyStatus: string | null;
  onChatPress: () => void;
}

export default function EmergencyStatusCard({
  activeEmergencyId,
  emergencyStatus,
  onChatPress,
}: EmergencyStatusCardProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeEmergencyId) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeEmergencyId, slideAnim, opacityAnim]);

  if (!activeEmergencyId) return null; // Or render nothing logic inside parent? Animation handles visual but removing from tree is good.
  // Actually we need to keep it mounted for exit animation if handled by parent state change, but here useEffect handles it.
  // We can return null if activeEmergencyId is null AND animation finished.
  // For simplicity, we just return the Animated View which will be hidden.

  return (
    <Animated.View
      style={[
        styles.statusCard,
        {
          backgroundColor: colors.surface,
          borderColor: branding.primaryColor,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statusCardContent}>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            SOS AKTIV
          </Text>
        </View>
        <Text style={styles.statusLabel}>
          {emergencyStatus === "accepted"
            ? "🚨 HILFE IST UNTERWEGS"
            : "🔍 SUCHE WACHMANN..."}
        </Text>
      </View>

      <TouchableOpacity onPress={onChatPress} style={styles.chatButton}>
        <Ionicons name="chatbubbles" size={22} color="white" />
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    position: "absolute",
    bottom: 180, // Above bottom section
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 90,
  },
  statusCardContent: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF5252",
    marginRight: 8,
  },
  statusTitle: {
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  statusLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
  chatButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

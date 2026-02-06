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
  onMapPress?: () => void;
  onCancelPress?: () => void;
}

export default function EmergencyStatusCard({
  activeEmergencyId,
  emergencyStatus,
  onChatPress,
  onMapPress,
  onCancelPress,
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

  if (!activeEmergencyId) return null;

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
      <TouchableOpacity
        onPress={onMapPress}
        style={styles.statusCardContent}
        activeOpacity={0.7}
      >
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
        <Text style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
          Tippen für Karte
        </Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onCancelPress}
          style={[
            styles.actionButton,
            { backgroundColor: "#FFEBEE", marginRight: 8 },
          ]}
        >
          <Ionicons name="close" size={24} color="#D32F2F" />
        </TouchableOpacity>

        {/* Chat Button */}
        <TouchableOpacity
          onPress={onChatPress}
          style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
    padding: 12,
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
    marginRight: 8,
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

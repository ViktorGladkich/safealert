import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  status: "new" | "accepted" | "resolved";
  timestamp: any;
  clientName?: string;
  type?: "normal" | "silent";
}

interface StaffEmergencyDetailCardProps {
  emergency: Emergency | null;
  onClose: () => void;
  onAccept: () => void;
  onResolve: () => void;
  onChat: () => void;
  onNavigate: () => void;
}

export default function StaffEmergencyDetailCard({
  emergency,
  onClose,
  onAccept,
  onResolve,
  onChat,
  onNavigate,
}: StaffEmergencyDetailCardProps) {
  const cardSlideAnim = useRef(new Animated.Value(300)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Animate card when emergency changes
  useEffect(() => {
    if (emergency) {
      Animated.parallel([
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(cardSlideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [emergency, cardSlideAnim, cardOpacityAnim]);

  if (!emergency) return null; // Or keep for exit animation, but simpler here

  return (
    <Animated.View
      style={[
        styles.detailCard,
        {
          transform: [{ translateY: cardSlideAnim }],
          opacity: cardOpacityAnim,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{emergency.clientName}</Text>
            {emergency.type === "silent" && (
              <View style={styles.silentBadge}>
                <Text style={styles.silentBadgeText}>Still</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTimestamp}>
            {emergency.timestamp?.seconds
              ? formatDistanceToNow(
                  new Date(emergency.timestamp.seconds * 1000),
                  { addSuffix: true, locale: de },
                )
              : "Gerade eben"}
          </Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardActions}>
        {emergency.status === "new" ? (
          <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
            <Ionicons name="shield-checkmark" size={24} color="white" />
            <Text style={styles.acceptButtonText}>Akzeptieren</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onChat} style={styles.chatButton}>
              <Ionicons name="chatbubbles" size={24} color="white" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onResolve} style={styles.resolveButton}>
              <Ionicons name="checkmark-done" size={24} color="white" />
              <Text style={styles.resolveButtonText}>Erledigt</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={onNavigate} style={styles.navigateButton}>
          <Ionicons name="navigate" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  silentBadge: {
    backgroundColor: "rgba(147, 51, 234, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  silentBadgeText: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardTimestamp: {
    color: "#888",
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 20,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  actionRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#374151",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
  resolveButton: {
    flex: 1,
    backgroundColor: "#15803D",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
  navigateButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

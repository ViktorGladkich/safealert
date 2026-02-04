import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { branding } from "../../config/branding";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message = "Bitte warten...",
}: LoadingOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={branding.primaryColor} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 160,
  },
  text: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

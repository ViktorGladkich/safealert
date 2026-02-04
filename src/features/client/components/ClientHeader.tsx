import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { branding } from "../../../config/branding";
import { useTheme } from "../../../hooks/useTheme";

interface ClientHeaderProps {
  onMenuPress: () => void;
  onLogout: () => void;
  showMenu: boolean;
}

export default function ClientHeader({
  onMenuPress,
  onLogout,
  showMenu,
}: ClientHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons
          name={showMenu ? "close" : "menu"}
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.headerLeft}>
        <Image
          source={branding.logoAsset}
          style={{ width: 32, height: 32, resizeMode: "contain" }}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          SafeAlert
        </Text>
      </View>

      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={22} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(125,125,125,0.1)",
    borderRadius: 22,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderRadius: 12,
  },
});

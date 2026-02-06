import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../hooks/useTheme";

interface ClientBottomSectionProps {
  activeEmergencyId: string | null;
  navigation: any;
}

const { width } = Dimensions.get("window");

export default function ClientBottomSection({
  activeEmergencyId,
  navigation,
}: ClientBottomSectionProps) {
  const { colors, isDark } = useTheme();

  const handleCall112 = () => {
    Linking.openURL("tel:112");
  };

  return (
    <View style={styles.container}>
      {/* Instruction Card - Floating above */}
      {!activeEmergencyId && (
        <View
          style={[
            styles.instructionCard,
            {
              backgroundColor: isDark
                ? "rgba(30,30,30,0.8)"
                : "rgba(255,255,255,0.9)",
            },
          ]}
        >
          <View style={styles.instructionItem}>
            <View style={[styles.dot, { backgroundColor: "#EF5350" }]} />
            <Text style={[styles.instructionText, { color: colors.text }]}>
              3s drücken{" "}
              <Text style={{ fontWeight: "300", opacity: 0.7 }}>für SOS</Text>
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.instructionItem}>
            <View style={[styles.dot, { backgroundColor: "#9C27B0" }]} />
            <Text style={[styles.instructionText, { color: colors.text }]}>
              6s drücken{" "}
              <Text style={{ fontWeight: "300", opacity: 0.7 }}>
                Stiller Alarm
              </Text>
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Sheet Action Area */}
      <View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            shadowColor: isDark ? "#000" : "#ccc",
          },
        ]}
      >
        <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={handleCall112}>
              <LinearGradient
                colors={["#D32F2F", "#EF5350"]}
                style={styles.actionIconContainer}
              >
                <Ionicons name="call" size={24} color="white" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Notruf 112
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("Subscription")}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA000"]}
                style={styles.actionIconContainer}
              >
                <Ionicons name="star" size={24} color="#000" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Premium
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("EmergencyContacts")}
            >
              <LinearGradient
                colors={["#388E3C", "#66BB6A"]}
                style={styles.actionIconContainer}
              >
                <Ionicons name="people" size={24} color="white" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Kontakte
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("ClientSettings")}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: isDark ? "#333" : "#f0f0f0" },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
              <Text
                style={[styles.actionLabel, { color: colors.textSecondary }]}
              >
                Optionen
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    zIndex: 10,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(128,128,128, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(128,128,128, 0.2)",
    marginHorizontal: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  instructionText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  safeArea: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },
  actionItem: {
    alignItems: "center",
    width: width / 4.5,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});

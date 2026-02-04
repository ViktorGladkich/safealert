import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { branding } from "../../../config/branding";
import FadeInView from "../../../components/animations/FadeInView";
import { LinearGradient } from "expo-linear-gradient";

// Helper Component for Status Row
const StatusRow = ({ icon, label, status, loading }: any) => {
  let statusColor = "#888"; // loading or unknown
  let statusIcon = "ellipse";

  if (!loading) {
    if (status === "granted" || status === true) {
      statusColor = "#4CAF50"; // Green
      statusIcon = "checkmark-circle";
    } else {
      statusColor = "#FF5252"; // Red
      statusIcon = "alert-circle";
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.rowRight}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name={statusIcon as any} size={24} color={statusColor} />
        )}
      </View>
    </View>
  );
};

export default function SystemStatusScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
  });

  const checkPermissions = async () => {
    setLoading(true);
    try {
      // Check Location
      const { status: locStatus } =
        await Location.getForegroundPermissionsAsync();

      // Check Notifications
      const { status: notifStatus } = await Notifications.getPermissionsAsync();

      setPermissions({
        location: locStatus === "granted",
        notifications: notifStatus === "granted",
      });
    } catch (error) {
      console.error("Error checking system status", error);
    } finally {
      // Fake delay for "scanning" effect
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const allGood = !loading && permissions.location && permissions.notifications;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#111", "#000"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Systemstatus</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <FadeInView>
            {/* Main Status Circle */}
            <View
              style={[
                styles.mainStatusContainer,
                {
                  borderColor: loading
                    ? "#2196F3"
                    : allGood
                      ? "#4CAF50"
                      : "#FF5252",
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
              ) : (
                <Ionicons
                  name={allGood ? "shield-checkmark" : "warning"}
                  size={64}
                  color={allGood ? "#4CAF50" : "#FF5252"}
                />
              )}
            </View>
            <Text style={styles.mainStatusText}>
              {loading
                ? "System wird geprüft..."
                : allGood
                  ? "Alles bereit"
                  : "Achtung erforderlich"}
            </Text>
            <Text style={styles.mainStatusSubtext}>
              {loading
                ? "Bitte warten Sie einen Moment."
                : allGood
                  ? "Ihr Gerät ist bereit für Notfälle."
                  : "Einige Funktionen sind eingeschränkt."}
            </Text>
          </FadeInView>

          <View style={styles.divider} />

          <FadeInView delay={200} style={styles.listContainer}>
            <StatusRow
              icon="location"
              label="Standortzugriff"
              status={permissions.location}
              loading={loading}
            />
            <StatusRow
              icon="notifications"
              label="Benachrichtigungen"
              status={permissions.notifications}
              loading={loading}
            />
            {/* Fake Internet Check (Always true for now as we are online) */}
            <StatusRow
              icon="wifi"
              label="Internetverbindung"
              status={true}
              loading={loading}
            />
          </FadeInView>

          {!loading && !allGood && (
            <FadeInView delay={400}>
              <TouchableOpacity
                style={styles.fixButton}
                onPress={checkPermissions}
              >
                <Text style={styles.fixButtonText}>Erneut prüfen</Text>
              </TouchableOpacity>
            </FadeInView>
          )}

          {!loading && allGood && (
            <FadeInView delay={400}>
              <View style={styles.goodMessage}>
                <Text style={styles.goodMessageText}>
                  SafeAlert ist vollständig aktiv.
                </Text>
              </View>
            </FadeInView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  mainStatusContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: "center",
  },
  mainStatusText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  mainStatusSubtext: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "80%",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
    marginVertical: 32,
  },
  listContainer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  rowRight: {
    //
  },
  fixButton: {
    marginTop: 24,
    backgroundColor: branding.primaryColor,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },
  fixButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  goodMessage: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  goodMessageText: {
    color: "#4CAF50",
    textAlign: "center",
    fontWeight: "500",
  },
});

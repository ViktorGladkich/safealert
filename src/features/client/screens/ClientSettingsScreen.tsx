import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../config/firebase";
import {
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

const PRIMARY_COLOR = "#1E88E5";

export default function ClientSettingsScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Fehler", "Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update Password
      await updatePassword(user, newPassword);

      Alert.alert("Erfolg", "Passwort wurde erfolgreich geändert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Fehler", "Das aktuelle Passwort ist falsch.");
      } else {
        Alert.alert(
          "Fehler",
          "Passwort konnte nicht geändert werden. Bitte prüfen Sie Ihre Eingaben.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "RoleSelection" as never }],
      });
    } catch (error) {
      Alert.alert("Fehler", "Abmelden fehlgeschlagen.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Einstellungen</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Section: App Settings (Notifications & Location) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Einstellungen</Text>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Linking.openSettings()}
            >
              <View style={styles.settingRowLeft}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                <Text style={styles.settingLabel}>Benachrichtigungen</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Linking.openSettings()}
            >
              <View style={styles.settingRowLeft}>
                <Ionicons name="location-outline" size={24} color="#FFF" />
                <Text style={styles.settingLabel}>Standortzugriff</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Section: Membership */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mitgliedschaft</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate("Subscription" as never)}
            >
              <View style={styles.settingRowLeft}>
                <Ionicons name="card-outline" size={24} color="#FFD700" />
                <Text style={styles.settingLabel}>Abo & Pläne</Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={{ color: "#888", fontSize: 14 }}>Free</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sicherheit</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Aktuelles Passwort</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="******"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Neues Passwort</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="******"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Passwort bestätigen</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="******"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Passwort ändern</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rechtliches</Text>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Datenschutzerklärung</Text>
              <Ionicons name="open-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Nutzungsbedingungen (AGB)</Text>
              <Ionicons name="open-outline" size={20} color="#666" />
            </TouchableOpacity>
            <View style={{ marginTop: 16 }}>
              <Text
                style={{ color: "#666", fontSize: 12, textAlign: "center" }}
              >
                SafeAlert v1.0.2
              </Text>
            </View>
          </View>

          {/* Section: Logout */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF5252" />
              <Text style={styles.logoutButtonText}>Abmelden</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
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
    padding: 20,
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#424242",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderRadius: 12,
  },
  logoutButtonText: {
    color: "#FF5252",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    color: "#FFF",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
});

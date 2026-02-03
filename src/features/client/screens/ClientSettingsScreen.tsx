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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../config/firebase";
import { signOut, updatePassword, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

const PRIMARY_COLOR = "#1E88E5";

export default function ClientSettingsScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [name, setName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update Auth Profile
      await updateProfile(user, { displayName: name });

      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: name });

      Alert.alert("Erfolg", "Profil wurde aktualisiert.");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Fehler",
        error.message || "Profil konnte nicht aktualisiert werden.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    setLoading(true);
    try {
      await updatePassword(user, newPassword);
      Alert.alert("Erfolg", "Passwort wurde geändert.");
      setNewPassword("");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Fehler",
        "Bitte loggen Sie sich erneut ein, um das Passwort zu ändern.",
      );
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
          {/* Section: Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mein Profil</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ihr Name"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Speichern</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sicherheit</Text>

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

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Passwort ändern</Text>
            </TouchableOpacity>
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
});

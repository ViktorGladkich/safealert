import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image, // Added Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const STAFF_COLOR = "#FF5722";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { branding } from "../../../config/branding"; // Added branding
import { Alert } from "react-native";

export default function StaffLoginScreen() {
  const navigation = useNavigation();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffId || !password) {
      Alert.alert("Fehler", "Bitte Personal-ID und Passwort eingeben.");
      return;
    }

    setIsLoading(true);
    try {
      // Assuming Staff ID is used as email prefix for internal auth
      // You should create these users in Firebase Console manually or via Admin SDK
      // e.g. "staff1" -> "staff1@safealert.com"
      const email = staffId.includes("@")
        ? staffId
        : `${staffId}@safealert.com`;

      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Success
      navigation.navigate("StaffNavigator" as never);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Anmeldung fehlgeschlagen.";
      if (error.code === "auth/invalid-email")
        errorMessage = "Ungültige E-Mail-Adresse.";
      if (error.code === "auth/user-not-found")
        errorMessage = "Benutzer nicht gefunden.";
      if (error.code === "auth/wrong-password")
        errorMessage = "Falsches Passwort.";

      Alert.alert("Fehler", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#200505", "#FF572233"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Icon */}
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image source={branding.logoAsset} style={styles.logo} />
              </View>

              <Text style={styles.title}>Personal-Zugang</Text>
              <Text style={styles.subtitle}>
                Nur für autorisiertes Personal
              </Text>

              {/* Staff ID Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={STAFF_COLOR}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Personal-ID"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={staffId}
                  onChangeText={setStaffId}
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={STAFF_COLOR}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Passwort"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Anmelden</Text>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 100,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 18,
    fontSize: 16,
  },
  loginButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: STAFF_COLOR,
    marginTop: 24,
    shadowColor: STAFF_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 50,
  },
});

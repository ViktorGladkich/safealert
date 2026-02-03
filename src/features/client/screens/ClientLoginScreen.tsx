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
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { branding } from "../../../config/branding";

const PRIMARY_COLOR = branding.primaryColor;

export default function ClientLoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Fehler", "Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Success - navigation will be handled by auth state listener or just navigate here
      navigation.navigate("ClientHome" as never);
    } catch (error: any) {
      console.error("Login Error:", error);

      let errorMessage = "Anmeldung fehlgeschlagen.";
      if (error.code === "auth/invalid-email")
        errorMessage = "Ungültige E-Mail-Adresse.";
      if (error.code === "auth/user-not-found")
        errorMessage = "Benutzer nicht gefunden.";
      if (error.code === "auth/wrong-password")
        errorMessage = "Falsches Passwort.";
      if (error.code === "auth/invalid-credential")
        errorMessage = "Ungültige Anmeldedaten.";

      Alert.alert("Fehler", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#051020", PRIMARY_COLOR + "33"]}
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
              {/* Logo */}
              <Image source={branding.logoAsset} style={styles.logo} />

              <Text style={styles.title}>Kunden-Login</Text>
              <Text style={styles.subtitle}>Bitte melden Sie sich an</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-Mail"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={PRIMARY_COLOR}
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

              <TouchableOpacity
                onPress={() => Alert.alert("Todo", "Forgot Password flow")}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Passwort vergessen?
                </Text>
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
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
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 24,
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
    backgroundColor: PRIMARY_COLOR,
    marginTop: 24,
    shadowColor: PRIMARY_COLOR,
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
  forgotPassword: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  backButton: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 50,
  },
});

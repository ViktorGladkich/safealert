import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { branding } from "../../../config/branding";
import FadeInView from "../../../components/animations/FadeInView";

const PRIMARY_COLOR = branding.primaryColor;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Fehler", "Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "E-Mail gesendet",
        "Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet. Bitte überprüfen Sie Ihr Postfach (auch Spam).",
        [
          {
            text: "Zum Login",
            onPress: () => navigation.navigate("ClientLogin"),
          },
        ],
      );
    } catch (error: any) {
      console.error("Reset Error:", error);
      let errorMessage = "Fehler beim Senden der E-Mail.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Diese E-Mail-Adresse ist nicht registriert.";
      }
      if (error.code === "auth/invalid-email") {
        errorMessage = "Ungültige E-Mail-Adresse.";
      }
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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.content}>
            <FadeInView>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="lock-open-outline"
                  size={50}
                  color={PRIMARY_COLOR}
                />
              </View>

              <Text style={styles.title}>Passwort vergessen?</Text>
              <Text style={styles.subtitle}>
                Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen
                Anweisungen zum Zurücksetzen.
              </Text>

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
                  placeholder="Ihre E-Mail-Adresse"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                style={styles.resetButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.resetButtonText}>Link senden</Text>
                )}
              </TouchableOpacity>
            </FadeInView>
          </View>
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
    justifyContent: "center",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
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
    marginBottom: 24,
  },
  inputIcon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 16,
    fontSize: 16,
  },
  resetButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
});

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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { branding } from "../../../config/branding";
import FadeInView from "../../../components/animations/FadeInView";

const PRIMARY_COLOR = branding.primaryColor;

export default function ClientRegistrationScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Fehler", "Passwörter stimmen nicht überein.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Fehler",
        "Das Passwort muss mindestens 6 Zeichen lang sein.",
      );
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      // 2. Update Profile Display Name
      await updateProfile(user, { displayName: name });

      // 3. Create User Document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        role: "client",
        createdAt: serverTimestamp(),
      });

      // 4. Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "ClientHome" }],
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = "Registrierung fehlgeschlagen.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Diese E-Mail-Adresse wird bereits verwendet.";
      }
      if (error.code === "auth/invalid-email") {
        errorMessage = "Ungültige E-Mail-Adresse.";
      }
      if (error.code === "auth/weak-password") {
        errorMessage = "Das Passwort ist zu schwach.";
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <FadeInView style={styles.content}>
              {/* Logo */}
              <Image source={branding.logoAsset} style={styles.logo} />

              <Text style={styles.title}>Registrierung</Text>
              <Text style={styles.subtitle}>Erstellen Sie ein neues Konto</Text>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Vollständiger Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Passwort bestätigen"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                style={styles.registerButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrieren</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ClientLogin")}
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>
                  Bereits ein Konto?{" "}
                  <Text style={styles.loginLinkHighlight}>Anmelden</Text>
                </Text>
              </TouchableOpacity>
            </FadeInView>
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
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
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
    padding: 16,
    fontSize: 16,
  },
  registerButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    marginTop: 16,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 24,
    padding: 10,
  },
  loginLinkText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    zIndex: 10,
  },
});

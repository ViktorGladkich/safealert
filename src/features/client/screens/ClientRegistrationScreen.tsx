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
  Dimensions,
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
const { width } = Dimensions.get("window");

export default function ClientRegistrationScreen() {
  const navigation = useNavigation<any>();

  // Steps: 1 = Personal Info, 2 = Account Info
  const [step, setStep] = useState(1);

  // Step 1 Data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!firstName || !lastName || !phone) {
        Alert.alert("Fehler", "Bitte füllen Sie alle Felder aus.");
        return;
      }
      setStep(2);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      // 2. Update Profile
      await updateProfile(user, { displayName: fullName });

      // 3. Firestore Doc
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: fullName,
        phone: phone,
        role: "client",
        createdAt: serverTimestamp(),
      });

      // 4. Navigate
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
      if (error.code === "auth/invalid-password") {
        // Fixed error code check
        errorMessage = "Ungültiges Passwort.";
      }
      if (error.code === "auth/weak-password") {
        errorMessage = "Das Passwort ist zu schwach.";
      }
      Alert.alert("Fehler", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(provider, "Funktion folgt in Kürze.");
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
          {/* Header with Back Button and Progress */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Step Indicators */}
            <View style={styles.stepIndicatorContainer}>
              <View style={[styles.stepDot, step >= 1 && styles.activeDot]} />
              <View style={[styles.stepLine, step >= 2 && styles.activeLine]} />
              <View style={[styles.stepDot, step >= 2 && styles.activeDot]} />
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <FadeInView style={styles.content} key={step}>
              {/* Logo */}
              <Image source={branding.logoAsset} style={styles.logo} />

              <Text style={styles.title}>
                {step === 1 ? "Persönliche Daten" : "Zugangsdaten"}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? "Erzählen Sie uns von sich"
                  : "Sichern Sie Ihr Konto ab"}
              </Text>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.inputContainer,
                        { flex: 1, marginRight: 8 },
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Vorname"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nachname"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={PRIMARY_COLOR}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Telefonnummer"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              {/* STEP 2: Account Info */}
              {step === 2 && (
                <>
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
                </>
              )}

              {/* Main Action Button */}
              <TouchableOpacity
                onPress={handleNext}
                disabled={isLoading}
                style={styles.actionButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {step === 1 ? "Weiter" : "Konto erstellen"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Social Login (Only show on Step 1 or 2? Usually Step 1 or generic. Let's keep at Step 1 for easier entry) */}
              {step === 1 && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>ODER</Text>
                    <View style={styles.divider} />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin("Google")}
                    >
                      <Ionicons name="logo-google" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin("Apple")}
                    >
                      <Ionicons name="logo-apple" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("ClientLogin")}
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginLinkText}>
                      Bereits ein Konto?{" "}
                      <Text style={styles.loginLinkHighlight}>Anmelden</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeDot: {
    backgroundColor: PRIMARY_COLOR,
    transform: [{ scale: 1.2 }],
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: PRIMARY_COLOR,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
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
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 16,
    fontSize: 16,
  },
  actionButton: {
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
  actionButtonText: {
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "bold",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});

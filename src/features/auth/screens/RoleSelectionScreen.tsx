import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { branding } from "../../../config/branding";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const RoleButton = ({
  title,
  icon,
  gradientColors,
  shadowColor,
  onPress,
  pulsing,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulsing) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.04,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [pulsing, scaleAnim]);

  const ButtonContent = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.buttonGradient,
        {
          shadowColor: shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={28} color="white" />
      </View>
      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="rgba(255,255,255,0.7)"
      />
    </LinearGradient>
  );

  if (pulsing) {
    return (
      <Animated.View
        style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
          {ButtonContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.buttonContainer}
    >
      {ButtonContent}
    </TouchableOpacity>
  );
};

export default function RoleSelectionScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#051020", branding.primaryColor + "4D"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View
              style={[
                styles.logoContainer,
                {
                  shadowColor: branding.primaryColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 40,
                  elevation: 20,
                },
              ]}
            >
              <Image source={branding.logoAsset} style={styles.logo} />
            </View>

            {/* Company Name */}
            <Text style={styles.companyName}>{branding.companyName}</Text>

            {/* City */}
            <Text style={styles.city}>{branding.city}</Text>

            {/* Client Button */}
            <RoleButton
              title="KUNDE"
              icon="person-outline"
              gradientColors={["#0D47A1", "#1976D2"]}
              shadowColor="#0D47A1"
              onPress={() => navigation.navigate("ClientLogin")}
            />

            {/* Staff Button */}
            <RoleButton
              title="PERSONAL"
              icon="shield-checkmark-outline"
              gradientColors={["#BF360C", "#FF5722"]}
              shadowColor="#FF5722"
              onPress={() => navigation.navigate("StaffLogin")}
            />

            <View style={styles.spacer} />

            {/* Copyright */}
            <Text style={styles.copyright}>© 2025 {branding.companyName}</Text>
          </View>
        </ScrollView>
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
    justifyContent: "center",
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    borderRadius: 100,
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  companyName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  city: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 50,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    width: "100%",
    height: 80,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 26,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  spacer: {
    height: 60,
  },
  copyright: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "center",
  },
});

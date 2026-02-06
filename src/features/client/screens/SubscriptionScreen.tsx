import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [isYearly, setIsYearly] = useState(true);

  // Example state: "free" or "premium"
  // In real app, fetch from user profile
  const currentPlan = "free";

  const freeFeatures = [
    "SOS an Private Kontakte (max 3)",
    "Lokaler Alarm (Sirene)",
    "Standort teilen (Manuell)",
  ];

  const premiumFeatures = [
    "24/7 Professionelle Leitstelle",
    "Automatische GPS-Verfolgung",
    "Unbegrenzte Notfallkontakte",
    "Priorisierte Polizeialarmierung",
    "Werbefrei",
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#1a237e"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Wähle deinen Schutz</Text>
          <Text style={styles.subtitle}>
            Upgrade auf Premium für maximale Sicherheit.
          </Text>

          {/* Plan Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, !isYearly && styles.activeLabel]}>
              Monatlich
            </Text>
            <Switch
              value={isYearly}
              onValueChange={setIsYearly}
              trackColor={{ false: "#333", true: "#FFD700" }}
              thumbColor={isYearly ? "#FFF" : "#FFF"}
            />
            <Text style={[styles.toggleLabel, isYearly && styles.activeLabel]}>
              Jährlich (-25%)
            </Text>
          </View>

          {/* FREE PLAN */}
          <View style={[styles.planCard, styles.freeCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>Basic (Free)</Text>
              {currentPlan === "free" && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Aktuell</Text>
                </View>
              )}
            </View>
            <Text style={styles.priceText}>0 €</Text>
            <View style={styles.divider} />
            {freeFeatures.map((feat, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#ccc"
                />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.downgradeButton} disabled>
              <Text style={styles.downgradeText}>Ihr aktueller Plan</Text>
            </TouchableOpacity>
          </View>

          {/* PREMIUM PLAN */}
          <View style={[styles.planCard, styles.premiumCard]}>
            <LinearGradient
              colors={["rgba(255, 215, 0, 0.1)", "rgba(255, 160, 0, 0.05)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EMPFLOHLEN</Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={[styles.planName, { color: "#FFD700" }]}>
                Premium
              </Text>
            </View>
            <Text style={styles.priceText}>
              {isYearly ? "89,99 €" : "9,99 €"}
              <Text style={styles.periodText}>
                {isYearly ? "/Jahr" : "/Monat"}
              </Text>
            </Text>

            <View style={styles.divider} />

            {premiumFeatures.map((feat, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.upgradeButton}>
              <LinearGradient
                colors={["#FFD700", "#FFA000"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.upgradeText}>Jetzt Testen</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Premium ist jederzeit kündbar. 7 Tage kostenlos testen.
          </Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 12,
  },
  toggleLabel: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  activeLabel: {
    color: "#FFF",
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  freeCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "rgba(255,255,255,0.1)",
  },
  premiumCard: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(20, 20, 20, 0.8)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1.02 }], // Slightly larger
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  currentBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  badgeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
  priceText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  periodText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "normal",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    color: "#EEE",
    fontSize: 14,
  },
  downgradeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  downgradeText: {
    color: "#666",
  },
  upgradeButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  disclaimer: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SosButton from "../../../components/SosButton";
import * as Location from "expo-location";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { branding } from "../../../config/branding";
import { useTheme } from "../../../hooks/useTheme";

const PRIMARY_COLOR = branding.primaryColor;
type AlarmType = "normal" | "silent";

export default function ClientHomeScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(
    null,
  );
  const [emergencyStatus, setEmergencyStatus] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Load User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as any);
          } else {
            // Fallback if no profile exists yet
            setUserProfile({
              name: auth.currentUser.displayName || "Kunde",
              email: auth.currentUser.email || "",
            });
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
        }
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Berechtigung verweigert",
          "Wir benötigen Ihren Standort, um Hilfe zu senden.",
        );
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Animate status card
  useEffect(() => {
    if (activeEmergencyId) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeEmergencyId, slideAnim, opacityAnim]);

  // Animate menu
  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: showMenu ? 1 : 0,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [showMenu, menuAnim]);

  // Listen for my latest active emergency
  useEffect(() => {
    if (!auth.currentUser) return;

    // Query emergencies specifically for THIS user or by device ID logic if needed.
    // Ideally we should filter by userId, but for now we look for any active emergency created by this client logic
    // We'll update the CREATE logic to include userId.
    // NOTE: This query might need an index if you filter by userId AND status AND timestamp
    // For now, let's keep it simple or filter client-side if needed,
    // BUT we should adding userId to the query would be robust.
    // Let's rely on the fact that we create it with our ID.

    // Simplified query to avoid missing index error
    // We fetch latest emergencies and filter locally for now
    const q = query(
      collection(db, "emergencies"),
      orderBy("timestamp", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let foundActive = false;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const isMyEmergency = data.userId === auth.currentUser?.uid;
        const isActive = ["new", "accepted"].includes(data.status);

        if (isMyEmergency && isActive) {
          setActiveEmergencyId(doc.id);
          setEmergencyStatus(data.status);
          foundActive = true;
          break; // Found our active emergency
        }
      }

      if (!foundActive) {
        setActiveEmergencyId(null);
        setEmergencyStatus(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Live Tracking Effect
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      if (!activeEmergencyId) return;

      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000, // Update every 3 seconds
            distanceInterval: 5, // Update every 5 meters
          },
          async (newLoc) => {
            setLocation(newLoc); // Update local state

            // Push to Firestore
            try {
              const docRef = doc(db, "emergencies", activeEmergencyId);
              await updateDoc(docRef, {
                latitude: newLoc.coords.latitude,
                longitude: newLoc.coords.longitude,
              });
            } catch (error) {
              console.log("Error updating location", error);
            }
          },
        );
      } catch (error) {
        console.error("Could not start tracking", error);
      }
    };

    if (activeEmergencyId) {
      startTracking();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [activeEmergencyId]);

  const handleAlarm = async (type: AlarmType) => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const docRef = await addDoc(collection(db, "emergencies"), {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
        timestamp: serverTimestamp(),
        status: "new",
        type: type,
        // Use Real Data
        clientName: userProfile?.name || "Unbekannter Kunde",
        clientPhone: userProfile?.email || "No Email", // Or phone if available
        userId: auth.currentUser.uid,
      });

      console.log("Emergency Created with ID: ", docRef.id);
      Alert.alert("SOS GESENDET!", "Hilfe ist unterwegs.");
    } catch (e) {
      console.error("Error adding emergency: ", e);
      Alert.alert(
        "Fehler",
        "SOS konnte nicht gesendet werden. Bitte rufen Sie die Polizei an.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "RoleSelection" as never }],
    });
  };

  const handleCall112 = () => {
    Linking.openURL("tel:112");
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Mein Profil",
      subtitle: "Daten bearbeiten",
      onPress: () => Alert.alert("Profil", "Demnächst!"),
    },
    {
      icon: "people-outline",
      title: "Notfallkontakte",
      subtitle: "Verwalten",
      onPress: () => (navigation as any).navigate("EmergencyContacts"),
    },
    {
      icon: "time-outline",
      title: "Historie",
      subtitle: "Vergangene Alarme",
      onPress: () => Alert.alert("Historie", "Demnächst!"),
    },
    {
      icon: "settings-outline",
      title: "Einstellungen",
      subtitle: "App Einstellungen",
      onPress: () => (navigation as any).navigate("ClientSettings"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={styles.menuButton}
          >
            <Ionicons
              name={showMenu ? "close" : "menu"}
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerLeft}>
            <Image
              source={branding.logoAsset}
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              SafeAlert
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Menu Overlay */}
      {showMenu && (
        <Animated.View
          style={[
            styles.menuOverlay,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              opacity: menuAnim,
              transform: [
                {
                  translateX: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
            <ScrollView style={styles.menuScroll}>
              <View
                style={[
                  styles.menuHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.menuAvatar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.menuAvatarText}>
                    {userProfile?.name?.charAt(0).toUpperCase() || "K"}
                  </Text>
                </View>
                <Text style={[styles.menuUserName, { color: colors.text }]}>
                  {userProfile?.name || "Kunde"}
                </Text>
                <Text
                  style={[
                    styles.menuUserEmail,
                    { color: colors.textSecondary },
                  ]}
                >
                  {userProfile?.email || "Lädt..."}
                </Text>
              </View>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    item.onPress();
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text
                      style={[styles.menuItemTitle, { color: colors.text }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.menuItemSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Main Content - SOS Button Centered */}
      <View style={styles.mainContent}>
        <View style={styles.sosContainer}>
          <SosButton onAlarm={handleAlarm} />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Bottom Section */}
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.bottomSection, { backgroundColor: colors.background }]}
      >
        {/* Instruction */}
        {!activeEmergencyId && (
          <View style={styles.instructionContainer}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              Anleitung
            </Text>
            <View style={styles.instructionRow}>
              <View style={styles.instructionDot} />
              <Text
                style={[
                  styles.instructionText,
                  { color: colors.textSecondary },
                ]}
              >
                3 Sek. halten → SOS Alarm
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <View
                style={[styles.instructionDot, styles.instructionDotPurple]}
              />
              <Text
                style={[
                  styles.instructionText,
                  { color: colors.textSecondary },
                ]}
              >
                6 Sek. halten → Stiller Alarm
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View
          style={[
            styles.quickActionsContainer,
            {
              backgroundColor: colors.surfaceHighlight,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity style={styles.quickAction} onPress={handleCall112}>
            <LinearGradient
              colors={["#C62828", "#EF5350"]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="call" size={26} color="white" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Notruf 112
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert("Standort", "Demnächst verfügbar!")}
          >
            <LinearGradient
              colors={["#1565C0", "#42A5F5"]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="location" size={26} color="white" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Standort
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate("EmergencyContacts")}
          >
            <LinearGradient
              colors={["#2E7D32", "#66BB6A"]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="people" size={26} color="white" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Kontakte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate("ClientSettings")}
          >
            <LinearGradient
              colors={["#5E35B1", "#9575CD"]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="settings" size={26} color="white" />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Einstellungen
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Status Card */}
      {activeEmergencyId && (
        <Animated.View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.surface,
              borderColor: branding.primaryColor,
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statusCardContent}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                SOS AKTIV
              </Text>
            </View>
            <Text style={styles.statusLabel}>
              {emergencyStatus === "accepted"
                ? "🚨 HILFE IST UNTERWEGS"
                : "🔍 SUCHE WACHMANN..."}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate("Chat", {
                emergencyId: activeEmergencyId,
                userName: userProfile?.name || "Kunde",
                userId: auth.currentUser?.uid,
              })
            }
            style={styles.chatButton}
          >
            <Ionicons name="chatbubbles" size={22} color="white" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color handled dynamically
  },
  safeArea: {
    // Background color handled dynamically
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // Border color handled dynamically
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    // Color handled dynamically
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderRadius: 12,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sosContainer: {
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
  },
  bottomSection: {
    // Background color handled dynamically
  },
  instructionContainer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    // Color handled dynamically
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  instructionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF5350",
    marginRight: 12,
  },
  instructionDotPurple: {
    backgroundColor: "#9C27B0",
  },
  instructionText: {
    fontSize: 14,
    // Color handled dynamically
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    // Background and border color handled dynamically
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    // Color handled dynamically
  },
  // Menu Styles
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(125,125,125,0.1)", // Neutral transparent for both modes
    borderRadius: 22,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: Dimensions.get("window").width * 0.8, // 80% width
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderRightWidth: 1,
    // Background and border handled dynamically
  },
  menuScroll: {
    flex: 1,
  },
  menuHeader: {
    padding: 24,
    borderBottomWidth: 1,
    marginBottom: 8,
    // Border color handled dynamically
  },
  menuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    // Background color handled dynamically
  },
  menuAvatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  menuUserName: {
    fontSize: 20,
    fontWeight: "bold",
    // Color handled dynamically
  },
  menuUserEmail: {
    // color: "#888", // Handled dynamically
    fontSize: 14,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemIcon: {
    width: 40,
    justifyContent: "center",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    // Color handled dynamically
  },
  menuItemSubtitle: {
    // color: "#666", // Handled dynamically
    fontSize: 12,
    marginTop: 2,
  },
  statusCard: {
    position: "absolute",
    bottom: 180,
    left: 16,
    right: 16,
    // backgroundColor: "#1A1A1A", // Handled dynamically
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    // borderColor: "rgba(255, 82, 82, 0.4)", // Handled dynamically
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusCardContent: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF5252",
  },
  statusTitle: {
    // color: "#fff", // Handled dynamically
    fontWeight: "bold",
    fontSize: 15,
  },
  statusLabel: {
    color: "#FFC107",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { UserProfile } from "../hooks/useClientProfile";
import { LinearGradient } from "expo-linear-gradient";
import { branding } from "../../../config/branding";

interface ClientMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  userProfile: UserProfile | null;
}

const { width, height } = Dimensions.get("window");

export default function ClientMenu({
  visible,
  onClose,
  navigation,
  userProfile,
}: ClientMenuProps) {
  const { colors, isDark } = useTheme();
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: visible ? 1 : 0,
      damping: 25,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, menuAnim]);

  const menuItems = [
    {
      label: "Hauptmenü",
      items: [
        {
          icon: "person-outline",
          title: "Mein Profil",
          onPress: () => navigation.navigate("ClientSettings"),
        },
        {
          icon: "time-outline",
          title: "Historie",
          onPress: () => navigation.navigate("ClientHistory"),
        },
      ],
    },
    {
      label: "Einstellungen & Hilfe",
      items: [
        {
          icon: "hardware-chip-outline",
          title: "Systemstatus",
          onPress: () => navigation.navigate("SystemStatus"),
        },
        {
          icon: "people-outline",
          title: "Notfallkontakte",
          onPress: () => navigation.navigate("EmergencyContacts"),
        },
        {
          icon: "settings-outline",
          title: "App Einstellungen",
          onPress: () => navigation.navigate("ClientSettings"),
        },
        {
          icon: "help-circle-outline",
          title: "Hilfe & FAQ",
          onPress: () => navigation.navigate("Help"),
        },
      ],
    },
  ];

  if (!visible && (menuAnim as any)._value === 0) return null;

  return (
    <>
      {/* Backdrop (Click to close) */}
      <Animated.View style={[styles.backdrop, { opacity: menuAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.menuContainer,
          {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            transform: [
              {
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width * 0.85, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark ? ["#1F1F1F", "#121212"] : [branding.primaryColor, "#1a237e"]
          } // Dark gradient or Brand gradient
          style={styles.headerBackground}
        >
          <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {userProfile?.name?.charAt(0).toUpperCase() || "K"}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userProfile?.name || "Kunde"}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {userProfile?.email || "Lädt..."}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((section, sIndex) => (
            <View key={sIndex} style={styles.section}>
              <Text
                style={[styles.sectionLabel, { color: colors.textSecondary }]}
              >
                {section.label.toUpperCase()}
              </Text>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    {
                      borderBottomColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    item.onPress();
                  }}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: isDark ? "#2A2A2A" : "#F5F7FA" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={isDark ? "#FFF" : "#333"}
                    />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Version 1.0.2 • SafeAlert
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.85,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden", // For the border radius
  },
  headerBackground: {
    paddingBottom: 24,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  userDetails: {
    justifyContent: "center",
  },
  userName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 10,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
  },
});

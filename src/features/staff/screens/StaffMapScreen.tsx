import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  Linking,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

// Pulsing marker animation component
const PulsingMarker = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.pulsingMarker,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const STAFF_COLOR = "#FF5722";
const DRESDEN_REGION = {
  latitude: 51.0504,
  longitude: 13.7373,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  status: "new" | "accepted" | "resolved";
  timestamp: any;
  clientName?: string;
  type?: "normal" | "silent";
}

export default function StaffMapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
    null,
  );

  const cardSlideAnim = useRef(new Animated.Value(300)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Animate card when emergency is selected
  useEffect(() => {
    if (selectedEmergency) {
      Animated.parallel([
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(cardSlideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedEmergency, cardSlideAnim, cardOpacityAnim]);

  // Request Location Permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Standortzugriff verweigert");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const [sound, setSound] = useState<Audio.Sound>();

  // Play Alert Sound
  async function playAlertSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../../assets/sounds/siren.mp3"),
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound", error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Subscribe to Emergencies and Auto-Zoom
  useEffect(() => {
    // Simplified query
    const q = query(collection(db, "emergencies"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ems: Emergency[] = [];
        let hasNew = false;

        const activeStatuses = ["new", "accepted"];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.latitude &&
            data.longitude &&
            activeStatuses.includes(data.status)
          ) {
            ems.push({
              id: doc.id,
              latitude: data.latitude,
              longitude: data.longitude,
              status: data.status,
              timestamp: data.timestamp,
              clientName: data.clientName || "Unbekannter Kunde",
              type: data.type || "normal",
            } as Emergency);
          }
        });

        // Check for new emergencies
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.status === "new") hasNew = true;
          }
        });

        if (hasNew) {
          playAlertSound();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setEmergencies(ems);
        setLoading(false);

        // Auto-Zoom to markers if we have any
        if (ems.length > 0 && mapRef.current) {
          // Need a small delay for map to be ready sometimes
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(
              ems.map((e) => ({
                latitude: e.latitude,
                longitude: e.longitude,
              })),
              {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              },
            );
          }, 500);
        }
      },
      (error) => {
        console.error("Error fetching emergencies:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleMarkerPress = (e: any, emergency: Emergency) => {
    e.stopPropagation(); // Stop map from catching this press
    setSelectedEmergency(emergency);
    mapRef.current?.animateToRegion(
      {
        latitude: emergency.latitude - 0.005,
        longitude: emergency.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500,
    );
  };

  const handleAcceptEmergency = async () => {
    if (!selectedEmergency) return;
    try {
      const emergencyRef = doc(db, "emergencies", selectedEmergency.id);
      await updateDoc(emergencyRef, {
        status: "accepted",
        acceptedBy: "Staff Member 1",
        acceptedAt: new Date(),
      });
      Alert.alert("AKZEPTIERT", "Navigation gestartet.");
      openMapsNavigation(
        selectedEmergency.latitude,
        selectedEmergency.longitude,
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Fehler", "Konnte Notfall nicht akzeptieren.");
    }
  };

  const openMapsNavigation = (lat: number, lng: number) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const label = "Notfallort";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleResolveEmergency = async () => {
    if (!selectedEmergency) return;
    Alert.alert("Bestätigen", "Wurde der Notfall gelöst?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Gelöst",
        style: "destructive",
        onPress: async () => {
          try {
            const emergencyRef = doc(db, "emergencies", selectedEmergency.id);
            await updateDoc(emergencyRef, { status: "resolved" });
            setSelectedEmergency(null);
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>
              {emergencies.length} AKTIVE ALARME
            </Text>
          </View>
          <View style={styles.spacer} />
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={DRESDEN_REGION}
          showsUserLocation={true}
          showsMyLocationButton={true} // Enabled button to simplify centering
          onPress={() => setSelectedEmergency(null)}
          // Remove custom style on iOS to ensure markers are visible if issues persist,
          // or keep if it works. Let's keep simpler style for now.
        >
          {emergencies.map((em) => (
            <Marker
              key={em.id}
              coordinate={{ latitude: em.latitude, longitude: em.longitude }}
              onPress={(e) => handleMarkerPress(e, em)}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.markerCircle,
                    em.status === "accepted"
                      ? styles.markerAccepted
                      : styles.markerNew,
                  ]}
                >
                  {em.status === "new" && <PulsingMarker />}
                  <Ionicons
                    name={em.type === "silent" ? "mic-off" : "alert"}
                    size={20}
                    color="white"
                  />
                </View>
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>{em.clientName}</Text>
                </View>
              </View>
            </Marker>
          ))}

          {/* Route Line (Polyline) when Selected */}
          {selectedEmergency && location && (
            <Polyline
              coordinates={[
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                },
                {
                  latitude: selectedEmergency.latitude,
                  longitude: selectedEmergency.longitude,
                },
              ]}
              strokeColor="#FF5722"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF5800" />
          </View>
        )}

        {/* Bottom Card - Emergency Details */}
        {selectedEmergency && (
          <Animated.View
            style={[
              styles.detailCard,
              {
                transform: [{ translateY: cardSlideAnim }],
                opacity: cardOpacityAnim,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    {selectedEmergency.clientName}
                  </Text>
                  {selectedEmergency.type === "silent" && (
                    <View style={styles.silentBadge}>
                      <Text style={styles.silentBadgeText}>Still</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTimestamp}>
                  {selectedEmergency.timestamp?.seconds
                    ? formatDistanceToNow(
                        new Date(selectedEmergency.timestamp.seconds * 1000),
                        { addSuffix: true, locale: de },
                      )
                    : "Gerade eben"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedEmergency(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardActions}>
              {selectedEmergency.status === "new" ? (
                <TouchableOpacity
                  onPress={handleAcceptEmergency}
                  style={styles.acceptButton}
                >
                  <Ionicons name="shield-checkmark" size={24} color="white" />
                  <Text style={styles.acceptButtonText}>Akzeptieren</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() =>
                      (navigation as any).navigate("Chat", {
                        emergencyId: selectedEmergency.id,
                        userName: "Personal",
                        userId: "staff",
                      })
                    }
                    style={styles.chatButton}
                  >
                    <Ionicons name="chatbubbles" size={24} color="white" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleResolveEmergency}
                    style={styles.resolveButton}
                  >
                    <Ionicons name="checkmark-done" size={24} color="white" />
                    <Text style={styles.resolveButtonText}>Erledigt</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={() =>
                  openMapsNavigation(
                    selectedEmergency.latitude,
                    selectedEmergency.longitude,
                  )
                }
                style={styles.navigateButton}
              >
                <Ionicons name="navigate" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  alertBadge: {
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  alertBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  spacer: {
    width: 44,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
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
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerNew: {
    backgroundColor: "#DC2626",
  },
  markerAccepted: {
    backgroundColor: "#EAB308",
  },
  markerLabel: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    opacity: 0.9,
  },
  markerLabelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  pulsingMarker: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "red",
    borderRadius: 999,
  },
  detailCard: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  silentBadge: {
    backgroundColor: "rgba(147, 51, 234, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  silentBadgeText: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardTimestamp: {
    color: "#888",
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 20,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  actionRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#374151",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
  resolveButton: {
    flex: 1,
    backgroundColor: "#15803D",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "uppercase",
  },
  navigateButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

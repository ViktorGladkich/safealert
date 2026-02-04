import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

// Components
import StaffMapHeader from "../components/StaffMapHeader";
import StaffEmergencyMarker from "../components/StaffEmergencyMarker";
import StaffEmergencyDetailCard from "../components/StaffEmergencyDetailCard";

// Hooks
import { useStaffEmergencies } from "../hooks/useStaffEmergencies";
import { useStaffLocation } from "../hooks/useStaffLocation";

const DRESDEN_REGION = {
  latitude: 51.0504,
  longitude: 13.7373,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function StaffMapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const location = useStaffLocation();
  const { emergencies, loading } = useStaffEmergencies();
  const [selectedEmergency, setSelectedEmergency] = useState<any | null>(null);

  // Auto-Zoom when emergencies load
  useEffect(() => {
    if (emergencies.length > 0 && mapRef.current) {
      setTimeout(() => {
        // Safe check if ref exists
        mapRef.current?.fitToCoordinates(
          emergencies.map((e) => ({
            latitude: e.latitude,
            longitude: e.longitude,
          })),
          {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          },
        );
      }, 1000);
    }
  }, [emergencies.length]);

  const handleMarkerPress = (e: any, emergency: any) => {
    e.stopPropagation();
    setSelectedEmergency(emergency);
    mapRef.current?.animateToRegion(
      {
        latitude: emergency.latitude - 0.005, // Offset for card visibility
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
        acceptedBy: "Staff Member", // In real app use auth.currentUser.uid
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
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StaffMapHeader
        onBack={() => navigation.goBack()}
        activeCount={emergencies.length}
      />

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={DRESDEN_REGION}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPress={() => setSelectedEmergency(null)}
        >
          {emergencies.map((em) => (
            <StaffEmergencyMarker
              key={em.id}
              emergency={em}
              onPress={(e) => handleMarkerPress(e, em)}
            />
          ))}

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

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF5800" />
          </View>
        )}

        <StaffEmergencyDetailCard
          emergency={selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
          onAccept={handleAcceptEmergency}
          onResolve={handleResolveEmergency}
          onChat={() =>
            (navigation as any).navigate("Chat", {
              emergencyId: selectedEmergency.id,
              userName: "Sicherheitsdienst",
              userId: "staff", // Use real ID
            })
          }
          onNavigate={() =>
            openMapsNavigation(
              selectedEmergency.latitude,
              selectedEmergency.longitude,
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
});

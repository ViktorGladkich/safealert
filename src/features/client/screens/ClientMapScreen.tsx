import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

export default function ClientMapScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { emergencyId } = route.params;
  const mapRef = useRef<MapView>(null);

  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (!emergencyId) return;
    const unsub = onSnapshot(doc(db, "emergencies", emergencyId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setEmergencyData(data);
      }
    });
    return () => unsub();
  }, [emergencyId]);

  // Auto-zoom to fit User and Guard
  useEffect(() => {
    if (userLocation && emergencyData?.guardLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          {
            latitude: emergencyData.guardLocation.latitude,
            longitude: emergencyData.guardLocation.longitude,
          },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
          animated: true,
        },
      );
    }
  }, [userLocation, emergencyData?.guardLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        initialRegion={{
          latitude: userLocation?.latitude || 52.52,
          longitude: userLocation?.longitude || 13.405,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {emergencyData?.guardLocation && (
          <Marker
            coordinate={{
              latitude: emergencyData.guardLocation.latitude,
              longitude: emergencyData.guardLocation.longitude,
            }}
            title="Sicherheitsdienst"
            description="Auf dem Weg"
          >
            <View style={styles.guardMarker}>
              <Ionicons name="shield" size={20} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tracking</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    emergencyData?.status === "accepted"
                      ? "#4CAF50"
                      : "#FF9800",
                },
              ]}
            />
            <Text style={styles.statusText}>
              {emergencyData?.status === "accepted"
                ? "Wachmann ist unterwegs"
                : "Suche Wachmann..."}
            </Text>
          </View>
          {emergencyData?.guardETA && (
            <Text style={styles.etaText}>
              Ankunft in ca. {emergencyData.guardETA} min
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
    justifyContent: "space-between",
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
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  guardMarker: {
    backgroundColor: "#D32F2F", // Red shield
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  statusCard: {
    margin: 20,
    marginBottom: 40,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  etaText: {
    marginLeft: 18,
    color: "#666",
    fontSize: 14,
  },
});

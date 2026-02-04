import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

export function useClientLocation(activeEmergencyId: string | null) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  // Initial Permission & Current Location
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

  // Live Tracking when Emergency Active
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

  return location;
}

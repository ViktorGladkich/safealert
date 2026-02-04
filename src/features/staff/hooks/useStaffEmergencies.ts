import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  status: "new" | "accepted" | "resolved";
  timestamp: any;
  clientName?: string;
  type?: "normal" | "silent";
}

export function useStaffEmergencies() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Ignore if sound not found in dev
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

  useEffect(() => {
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

        // Check for new emergencies added in this snapshot
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.status === "new") hasNew = true;
          }
        });

        if (hasNew) {
          playAlertSound();
          if (Haptics.notificationAsync) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }

        setEmergencies(ems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching emergencies:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { emergencies, loading };
}

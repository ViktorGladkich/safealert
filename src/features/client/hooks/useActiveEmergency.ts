import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

export function useActiveEmergency() {
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(
    null,
  );
  const [emergencyStatus, setEmergencyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

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
          break;
        }
      }

      if (!foundActive) {
        setActiveEmergencyId(null);
        setEmergencyStatus(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { activeEmergencyId, emergencyStatus };
}

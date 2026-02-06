import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

export interface UserProfile {
  name: string;
  email: string;
}

export function useClientProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data() as UserProfile);
      } else {
        setUserProfile({
          name: auth.currentUser?.displayName || "Kunde",
          email: auth.currentUser?.email || "",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return userProfile;
}

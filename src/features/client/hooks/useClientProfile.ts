import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

export interface UserProfile {
  name: string;
  email: string;
}

export function useClientProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Fallback
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

  return userProfile;
}

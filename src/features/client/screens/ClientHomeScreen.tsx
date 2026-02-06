import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { db, auth } from "../../../config/firebase";
import { useTheme } from "../../../hooks/useTheme";

// Components
import SosButton from "../../../components/SosButton";
import ClientHeader from "../components/ClientHeader";
import ClientMenu from "../components/ClientMenu";
import ClientBottomSection from "../components/ClientBottomSection";
import EmergencyStatusCard from "../components/EmergencyStatusCard";

// Hooks
import { useClientLocation } from "../hooks/useClientLocation";
import { useClientProfile } from "../hooks/useClientProfile";
import { useActiveEmergency } from "../hooks/useActiveEmergency";

type AlarmType = "normal" | "silent";

export default function ClientHomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Custom Hooks
  const userProfile = useClientProfile();
  const { activeEmergencyId, emergencyStatus } = useActiveEmergency();
  const location = useClientLocation(activeEmergencyId);

  // Chat Notification Logic
  useEffect(() => {
    if (!activeEmergencyId) return;

    const messagesRef = collection(
      db,
      "emergencies",
      activeEmergencyId,
      "messages",
    );
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const message = change.doc.data();
          if (
            message.user?._id !== auth.currentUser?.uid &&
            message.createdAt
          ) {
            const now = new Date().getTime();
            const msgTime = message.createdAt?.toMillis
              ? message.createdAt.toMillis()
              : Date.now();
            if (now - msgTime < 10000) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "Neue Nachricht",
                  body: message.text || "Sie haben eine neue Nachricht.",
                  data: { emergencyId: activeEmergencyId, screen: "Chat" },
                },
                trigger: null,
              });
            }
          }
        }
      });
    });
    return () => unsubscribe();
  }, [activeEmergencyId]);

  const handleCancelAlarm = async () => {
    if (!activeEmergencyId) return;

    let message = "Möchten Sie den Alarm wirklich abbrechen?";
    let feeWarning = false;

    if (emergencyStatus === "accepted") {
      message =
        "ACHTUNG: Der Wachmann ist bereits unterwegs!\n\nBei Abbruch wird eine Gebühr von 50€ fällig.";
      feeWarning = true;
    }

    Alert.alert("Alarm abbrechen", message, [
      { text: "Nein, behalten", style: "cancel" },
      {
        text: feeWarning ? "Ja, kostenpflichtig abbrechen" : "Ja, abbrechen",
        style: "destructive",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "emergencies", activeEmergencyId), {
              status: "cancelled_by_client",
              cancellationFee: feeWarning,
              cancelledAt: serverTimestamp(),
            });
            Alert.alert(
              "Abgebrochen",
              feeWarning
                ? "Alarm abgebrochen. Die Gebühr wurde Ihrem Konto belastet."
                : "Alarm erfolgreich abgebrochen.",
            );
          } catch (e) {
            console.error("Cancel error", e);
            Alert.alert("Fehler", "Konnte nicht abgebrochen werden.");
          }
        },
      },
    ]);
  };

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
        clientName: userProfile?.name || "Unbekannter Kunde",
        clientPhone: userProfile?.email || "No Email",
        userId: auth.currentUser.uid,
      });

      console.log("Emergency Created with ID: ", docRef.id);
      Alert.alert("SOS GESENDET!", "Hilfe ist unterwegs.", [
        {
          text: "OK",
          onPress: () =>
            (navigation as any).navigate("ClientMap", {
              emergencyId: docRef.id,
            }),
        },
      ]);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <ClientHeader
          onMenuPress={() => setShowMenu(!showMenu)}
          onLogout={handleLogout}
          showMenu={showMenu}
        />
      </SafeAreaView>

      <ClientMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        navigation={navigation}
        userProfile={userProfile}
      />

      <EmergencyStatusCard
        activeEmergencyId={activeEmergencyId}
        emergencyStatus={emergencyStatus}
        onMapPress={() =>
          (navigation as any).navigate("ClientMap", {
            emergencyId: activeEmergencyId,
          })
        }
        onChatPress={() =>
          (navigation as any).navigate("Chat", {
            emergencyId: activeEmergencyId,
            userName: userProfile?.name || "Kunde",
            userId: auth.currentUser?.uid,
          })
        }
        onCancelPress={handleCancelAlarm}
      />

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

      <ClientBottomSection
        activeEmergencyId={activeEmergencyId}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    // bg handled inline
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sosContainer: {
    position: "relative",
    marginTop: -140, // Lift higher
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
});

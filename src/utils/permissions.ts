import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { registerForPushNotificationsAsync } from "./notifications";

export const requestAllPermissions = async () => {
  // 1. Notifications
  await registerForPushNotificationsAsync();

  // 2. Location (Foreground)
  const { status: locationStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (locationStatus !== "granted") {
    Alert.alert(
      "Standort benötigt",
      "Ohne Standortzugriff können wir im Notfall keine Hilfe senden. Bitte aktivieren Sie diesen in den Einstellungen.",
    );
  }

  // 3. Audio (for Chat/Video if needed later)
  // const { status: audioStatus } = await Audio.requestPermissionsAsync();
};

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import RoleSelectionScreen from "./src/features/auth/screens/RoleSelectionScreen";
import StaffLoginScreen from "./src/features/staff/screens/StaffLoginScreen";
import StaffNavigator from "./src/features/staff/StaffNavigator";
import ClientLoginScreen from "./src/features/client/screens/ClientLoginScreen";
import ClientRegistrationScreen from "./src/features/client/screens/ClientRegistrationScreen";
import ClientHomeScreen from "./src/features/client/screens/ClientHomeScreen";
import ClientHistoryScreen from "./src/features/client/screens/ClientHistoryScreen";
import SystemStatusScreen from "./src/features/client/screens/SystemStatusScreen"; // New
import HelpScreen from "./src/features/client/screens/HelpScreen"; // New
import ChatScreen from "./src/features/shared/screens/ChatScreen";

import EmergencyContactsScreen from "./src/features/client/screens/EmergencyContactsScreen";
import ClientSettingsScreen from "./src/features/client/screens/ClientSettingsScreen";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/config/toastConfig";

import { requestAllPermissions } from "./src/utils/permissions";

const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    requestAllPermissions();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
          animation: "fade", // Smooth transitions
        }}
      >
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
        <Stack.Screen name="StaffNavigator" component={StaffNavigator} />
        <Stack.Screen name="ClientLogin" component={ClientLoginScreen} />
        <Stack.Screen
          name="ClientRegistration"
          component={ClientRegistrationScreen}
        />
        <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
        <Stack.Screen name="ClientHistory" component={ClientHistoryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
        />
        <Stack.Screen name="ClientSettings" component={ClientSettingsScreen} />
        <Stack.Screen name="SystemStatus" component={SystemStatusScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}

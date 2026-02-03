import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StaffMapScreen from "./screens/StaffMapScreen"; // Check path relative to this file
import StaffHistoryScreen from "./screens/StaffHistoryScreen";
import StaffProfileScreen from "./screens/StaffProfileScreen";
import { View, Platform } from "react-native";

const Tab = createBottomTabNavigator();

export default function StaffNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E1E1E",
          borderTopColor: "#333",
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#FF5722",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Map"
        component={StaffMapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
          tabBarLabel: "Aktive Alarme",
        }}
      />
      <Tab.Screen
        name="History"
        component={StaffHistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          tabBarLabel: "Historie",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StaffProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: "Profil",
        }}
      />
    </Tab.Navigator>
  );
}

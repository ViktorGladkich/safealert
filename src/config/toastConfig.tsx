// Toast Config
import { BaseToast, ErrorToast } from "react-native-toast-message";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#4CAF50",
        backgroundColor: "#1E1E1E",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
      }}
      text2Style={{
        fontSize: 14,
        color: "#A0A0A0",
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#D32F2F",
        backgroundColor: "#1E1E1E",
        borderLeftWidth: 5,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
      }}
      text2Style={{
        fontSize: 14,
        color: "#A0A0A0",
      }}
    />
  ),
  // Custom "Emergency" Toast
  // Custom "Emergency" Toast
  emergency: ({ text1, text2 }: any) => (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: "#DC2626", // red-600
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#7F1D1D", // red-900
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#F87171", // red-400
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          padding: 8,
          borderRadius: 999,
          marginRight: 16,
        }}
      >
        <Ionicons name="alert-circle" size={30} color="white" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {text1}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
          {text2}
        </Text>
      </View>
    </View>
  ),
};

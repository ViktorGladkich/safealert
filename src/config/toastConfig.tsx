// Toast Config
import { BaseToast, ErrorToast } from "react-native-toast-message";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View
      style={{
        width: "90%",
        backgroundColor: "rgba(30, 30, 30, 0.95)", // Almost opaque dark
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderLeftWidth: 6,
        borderLeftColor: "#4CAF50",
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "white",
            marginBottom: 2,
          }}
        >
          {text1}
        </Text>
        <Text style={{ fontSize: 13, color: "#AAAAAA" }}>{text2}</Text>
      </View>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View
      style={{
        width: "90%",
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderLeftWidth: 6,
        borderLeftColor: "#EF5350",
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(239, 83, 80, 0.15)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name="alert-circle" size={24} color="#EF5350" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "white",
            marginBottom: 2,
          }}
        >
          {text1}
        </Text>
        <Text style={{ fontSize: 13, color: "#AAAAAA" }}>{text2}</Text>
      </View>
    </View>
  ),
  emergency: ({ text1, text2 }: any) => (
    <View
      style={{
        width: "90%",
        backgroundColor: "#DC2626", // Red primary
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#7F1D1D",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "rgba(255,255,255,0.2)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Ionicons name="warning" size={28} color="white" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "900",
            color: "white",
            textTransform: "uppercase",
            marginBottom: 2,
            letterSpacing: 0.5,
          }}
        >
          {text1}
        </Text>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
          {text2}
        </Text>
      </View>
    </View>
  ),
};

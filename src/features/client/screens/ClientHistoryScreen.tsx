import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { branding } from "../../../config/branding";
import FadeInView from "../../../components/animations/FadeInView";

export default function ClientHistoryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "emergencies"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc"),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmergencies(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: any) => {
    const date = item.timestamp?.toDate
      ? item.timestamp.toDate().toLocaleString()
      : "Datum unbekannt";
    const isResolved = item.status === "resolved";

    return (
      <FadeInView delay={index * 100}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isResolved ? "#4CAF50" : "#FF5252" },
              ]}
            >
              <Text style={styles.statusText}>
                {item.status?.toUpperCase() || "UNKNOWN"}
              </Text>
            </View>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <Text style={styles.typeText}>
            {item.type === "silent" ? "Stiller Alarm" : "SOS Alarm"}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#888" />
            <Text style={styles.locationText}>
              {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
            </Text>
          </View>
        </View>
      </FadeInView>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verlauf</Text>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={branding.primaryColor} />
          </View>
        ) : emergencies.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="time-outline" size={64} color="#333" />
            <Text style={styles.emptyText}>Keine Alarme gefunden.</Text>
          </View>
        ) : (
          <FlatList
            data={emergencies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  dateText: {
    color: "#888",
    fontSize: 12,
  },
  typeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#888",
    fontSize: 14,
    marginLeft: 6,
  },
});

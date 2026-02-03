import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const STAFF_COLOR = "#FF5722";

export default function StaffHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "emergencies"),
        // where("status", "==", "resolved"), // Removed to avoid index error
        orderBy("timestamp", "desc"),
        limit(50), // Fetch more to filter locally
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.status === "resolved"); // Filter locally
      setHistory(data);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={item.type === "silent" ? "mic-off" : "alert"}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.clientName}>
              {item.clientName || "Unbekannt"}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp
                ? format(item.timestamp.toDate(), "dd. MMM HH:mm", {
                    locale: de,
                  })
                : "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.resolvedBadge}>
          <Text style={styles.resolvedText}>Gelöst</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="location-outline" size={14} color="#888" />
        <Text style={styles.locationText}>
          Lat: {item.latitude?.toFixed(4)}, Lng: {item.longitude?.toFixed(4)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Einsatzhistorie</Text>
          <TouchableOpacity onPress={loadHistory} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            color={STAFF_COLOR}
            size="large"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={60} color="#555" />
                <Text style={styles.emptyText}>
                  Keine vergangenen Einsätze gefunden
                </Text>
              </View>
            }
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  historyCard: {
    backgroundColor: "#1E1E1E",
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  timestamp: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  resolvedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resolvedText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  locationText: {
    color: "#888",
    fontSize: 12,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#888",
    marginTop: 16,
    fontSize: 16,
  },
});

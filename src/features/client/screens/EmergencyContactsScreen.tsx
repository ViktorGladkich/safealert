import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

const PRIMARY_COLOR = "#1E88E5";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function EmergencyContactsScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [saving, setSaving] = useState(false);

  // Load Contacts
  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "users", auth.currentUser.uid, "contacts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedContacts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(loadedContacts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddContact = async () => {
    if (!newName || !newPhone) {
      Alert.alert("Fehler", "Bitte Name und Telefonnummer eingeben.");
      return;
    }

    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "contacts"), {
        name: newName,
        phone: newPhone,
        relation: newRelation || "Freund",
      });

      setModalVisible(false);
      setNewName("");
      setNewPhone("");
      setNewRelation("");
    } catch (error) {
      console.error("Error adding contact", error);
      Alert.alert("Fehler", "Kontakt konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert("Kontakt löschen", "Sind Sie sicher?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen",
        style: "destructive",
        onPress: async () => {
          if (!auth.currentUser) return;
          try {
            await deleteDoc(
              doc(db, "users", auth.currentUser.uid, "contacts", id),
            );
          } catch (e) {
            Alert.alert("Fehler", "Löschen fehlgeschlagen.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.cardLeft}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactRelation}>{item.relation}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteContact(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notfallkontakte</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.subtitle}>
          Diese Kontakte werden im Notfall benachrichtigt.
        </Text>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color="#555" />
              <Text style={styles.emptyText}>Keine Kontakte hinzugefügt</Text>
            </View>
          }
        />

        {/* Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={["#1E88E5", "#42A5F5"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Contact Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Neuen Kontakt</Text>

              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefonnummer"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Beziehung (z.B. Schwester)"
                placeholderTextColor="#888"
                value={newRelation}
                onChangeText={setNewRelation}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.saveButtonText}>Speichern</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    borderBottomColor: "rgba(255,255,255,0.08)",
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
  subtitle: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 20,
  },
  contactCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(30, 136, 229, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: "bold",
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactRelation: {
    color: "#888",
    fontSize: 12,
  },
  contactPhone: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderRadius: 12,
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

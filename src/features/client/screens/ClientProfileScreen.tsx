import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db, storage } from "../../../config/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const PRIMARY_COLOR = "#1E88E5";

export default function ClientProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [firstName, setFirstName] = useState(() => {
    const parts = user?.displayName?.split(" ") || [];
    return parts[0] || "";
  });
  const [lastName, setLastName] = useState(() => {
    const parts = user?.displayName?.split(" ") || [];
    return parts.slice(1).join(" ") || "";
  });
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || null);

  // Load additional profile data from Firestore on mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.phone) setPhone(data.phone);
        }
      } catch (e) {
        console.log("Error loading user data", e);
      }
    };
    fetchUserData();
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `avatars/${user?.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error("Upload failed", err);
      throw err;
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let photoURL = avatar;

      // If avatar is a local file (starts with file:// or content://), upload it
      if (
        avatar &&
        (avatar.startsWith("file://") || avatar.startsWith("content://"))
      ) {
        photoURL = await uploadAvatar(avatar);
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // Update Auth Profile
      await updateProfile(user, { displayName: fullName, photoURL: photoURL });

      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: fullName,
        phone: phone,
        photoURL: photoURL,
      });

      Alert.alert("Erfolg", "Profil wurde aktualisiert.");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Fehler",
        error.message || "Profil konnte nicht aktualisiert werden.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Mein Profil</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar Section */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: "#333",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Ionicons name="person" size={40} color="#888" />
                </View>
              )}
              <View style={styles.editIconBadge}>
                <Ionicons name="pencil" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Persönliche Daten</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Vorname</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Vorname"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nachname</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nachname"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefonnummer</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+49 123 456789"
                keyboardType="phone-pad"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Speichern</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
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
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  editIconBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
});

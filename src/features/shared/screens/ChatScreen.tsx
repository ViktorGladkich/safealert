import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  IMessage,
  Actions,
} from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ACCENT_COLOR = "#FF5722";

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { emergencyId, userName, userId } = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (!emergencyId) return;

    const messagesRef = collection(db, "emergencies", emergencyId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user,
          image: data.image,
        } as IMessage;
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [emergencyId]);

  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      const { _id, createdAt, text, user, image } = messages[0];

      addDoc(collection(db, "emergencies", emergencyId, "messages"), {
        _id,
        text: text || "",
        createdAt: serverTimestamp(),
        user,
        image: image || null,
      });
    },
    [emergencyId],
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } else {
      Alert.alert(
        "Permission denied",
        "Camera access is required to take photos.",
      );
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `chat/${emergencyId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      const message: IMessage = {
        _id: Date.now().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: userName || "anonymous",
          name: userName || "Anonymous",
        },
        image: downloadUrl,
      };

      onSend([message]);
    } catch (error) {
      console.error("Upload error", error);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: ACCENT_COLOR,
            borderBottomRightRadius: 0,
            marginBottom: 4,
          },
          left: {
            backgroundColor: "#333",
            borderBottomLeftRadius: 0,
            marginBottom: 4,
          },
        }}
        textStyle={{
          right: { color: "white" },
          left: { color: "white" },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "#1a1a1a",
        borderTopColor: "#333",
        paddingVertical: 4,
      }}
      textInputStyle={{ color: "white" }}
    />
  );

  const renderActions = (props: any) => (
    <Actions
      {...props}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        marginBottom: 4,
      }}
      icon={() => <Ionicons name="add-circle" size={28} color={ACCENT_COLOR} />}
      options={{
        "Foto aufnehmen": takePhoto,
        "Aus Galerie wählen": pickImage,
        Abbrechen: () => {},
      }}
      optionTintColor="#222B45"
    />
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={ACCENT_COLOR} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notfall-Chat</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color={ACCENT_COLOR} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userId || userName || "anonymous",
          name: userName || "Anonymous",
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderActions}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <Ionicons name="send" size={24} color={ACCENT_COLOR} />
            </View>
          </Send>
        )}
        listProps={{ style: { backgroundColor: "black" } }}
        isCustomViewBottom
      />

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.uploadingText}>Foto wird hochgeladen...</Text>
        </View>
      )}

      {Platform.OS === "android" && (
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={30} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerSafeArea: {
    backgroundColor: "#1a1a1a",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  callButton: {
    padding: 10,
    marginRight: -8,
    backgroundColor: "rgba(127, 29, 29, 0.5)",
    borderRadius: 20,
  },
  sendButton: {
    marginRight: 16,
    marginBottom: 8,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  uploadingText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "bold",
  },
});

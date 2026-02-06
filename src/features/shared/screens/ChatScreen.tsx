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
import { useTheme } from "../../../hooks/useTheme";

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
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
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow Images and Videos
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const type = result.assets[0].type ?? "image";
      uploadFile(result.assets[0].uri, type);
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
        uploadFile(result.assets[0].uri, "image"); // Camera is usually image only unless configured for video
      }
    } else {
      Alert.alert(
        "Permission denied",
        "Camera access is required to take photos.",
      );
    }
  };

  const uploadFile = async (
    uri: string,
    type: "image" | "video" | string = "image",
  ) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const extension = type === "video" ? "mp4" : "jpg";
      const filename = `chat/${emergencyId}/${Date.now()}.${extension}`;
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
        image: type !== "video" ? downloadUrl : undefined,
        video: type === "video" ? downloadUrl : undefined,
      };

      onSend([message]);
    } catch (error) {
      console.error("Upload error", error);
      Alert.alert("Error", "Failed to upload media.");
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
            backgroundColor: colors.accent,
            borderBottomRightRadius: 0,
            marginBottom: 4,
          },
          left: {
            backgroundColor: isDark ? "#333" : "#E0E0E0",
            borderBottomLeftRadius: 0,
            marginBottom: 4,
          },
        }}
        textStyle={{
          right: { color: "white" },
          left: { color: isDark ? "white" : "black" },
        }}
        timeTextStyle={{
          left: { color: isDark ? "#aaa" : "#555" },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingVertical: 4,
      }}
      textInputStyle={{ color: colors.text }}
    />
  );

  const renderActions = (props: any) => (
    <Actions
      {...props}
      containerStyle={{
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
        marginBottom: 4,
      }}
      icon={() => (
        <Ionicons name="add-circle" size={36} color={colors.accent} />
      )}
      onPressActionButton={() => {
        Alert.alert("Medien senden", "Wählen Sie eine Option", [
          { text: "Foto aufnehmen", onPress: takePhoto },
          { text: "Galerie öffnen", onPress: pickImage },
          { text: "Abbrechen", style: "cancel" },
        ]);
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={[
          styles.headerSafeArea,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.accent} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Notfall-Chat
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <GiftedChat
          messages={messages}
          timeFormat="HH:mm"
          dateFormat="DD.MM.YYYY"
          locale="de"
          textInputProps={{
            placeholder: "Nachricht schreiben...",
            style: {
              color: colors.text,
              flex: 1,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 16,
            },
          }}
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
                <Ionicons name="send" size={24} color={colors.accent} />
              </View>
            </Send>
          )}
          listProps={{ style: { backgroundColor: colors.background } }}
          isCustomViewBottom
        />
      </KeyboardAvoidingView>

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.uploadingText, { color: colors.text }]}>
            Foto wird hochgeladen...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background dynamic
  },
  headerSafeArea: {
    // Background and border dynamic
    zIndex: 10,
    borderBottomWidth: 1,
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
    fontWeight: "bold",
    fontSize: 18,
    // Color dynamic
  },
  callButton: {
    padding: 10,
    marginRight: -8,
    backgroundColor: "rgba(127, 29, 29, 0.2)",
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
    marginTop: 8,
    fontWeight: "bold",
    // Color dynamic
  },
});

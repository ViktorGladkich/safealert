import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

// Values from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAw7yT3B7qXY35Q4O29DylDVn4gYuStcso",
  authDomain: "safealert-455c5.firebaseapp.com",
  projectId: "safealert-455c5",
  storageBucket: "safealert-455c5.firebasestorage.app",
  messagingSenderId: "803296529846",
  appId: "1:803296529846:android:5787f0c5efdd7fe6414517", // Android App ID
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

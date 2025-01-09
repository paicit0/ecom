import { initializeApp,  } from "firebase/app";
import { initializeAuth, onAuthStateChanged, signInWithEmailAndPassword, User } from "firebase/auth";
import { firebaseConfig } from "../../firecloud/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getReactNativePersistence } from "firebase/auth";

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

async function saveToken(user: User | null) {
    if (user) {
      const token = await user.getIdToken();
      await SecureStore.setItemAsync("authToken", token);
    } else {
      await SecureStore.deleteItemAsync("authToken");
    }
  }

  onAuthStateChanged(auth, (user) => {
    saveToken(user);
  });

  export async function loginSaveSecureStore(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await saveToken(userCredential.user);
    return userCredential.user;
  }
  
  export async function logoutDeleteSecureStore() {
    await auth.signOut();
    await SecureStore.deleteItemAsync("authToken");
  }
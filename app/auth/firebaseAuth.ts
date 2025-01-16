//firebaseAuth.ts
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { firebaseConfig } from "../../firecloud/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
//@ts-ignore
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

interface userSessionType {
  userIsSignedIn: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  syncUserInfo: (email: string | null) => void;
  userInfo: {
    email: string | null;
    role: string | null;
  };
}

const SecureStorage: StateStorage = {
  getItem: async (name: string) => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    return SecureStore.deleteItemAsync(name);
  },
};

async function saveToken(user: User | null) {
  if (user) {
    const token = await user.getIdToken();
    await SecureStore.setItemAsync("authToken", token);
  } else {
    await SecureStore.deleteItemAsync("authToken");
  }
}

export const useUserSession = create<userSessionType>()(
  persist(
    (set) => ({
      userInfo: { email: "", role: "" },
      userIsSignedIn: false,
      login: async (email, password) => {
        if (!email || !password) {
          console.log("No email or password received.");
          return;
        }
        console.log("Saving userIsSignedIn to SecureStorage");
        SecureStorage.setItem("userIsSignedIn", "true");

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          const userRef = collection(db, "users");
          const emailQuery = query(userRef, where("email", "==", email));
          const querySnapshot = await getDocs(emailQuery);

          if (querySnapshot.empty) {
            throw new Error("No user found with this email.");
          }

          const userData = querySnapshot.docs[0].data();
          console.log("Setting userIsSignedIn to true");
          set({ userIsSignedIn: true });
          set({ userInfo: { email: email, role: userData.role } });
          await saveToken(userCredential.user);
        } catch (error) {
          console.error("Login failed:", error);
        }
      },

      logout: async () => {
        try {
          console.log("Removing userIsSignedIn from SecureStorage");
          SecureStorage.removeItem("userIsSignedIn");
          console.log("Setting userIsSignedIn to false");
          set({ userIsSignedIn: false });
          console.log("Setting userInfo to default");
          set({ userInfo: { email: "", role: null } });
          await auth.signOut();
          await SecureStore.deleteItemAsync("authToken");
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },

      syncUserInfo: async (email) => {
        try {
          const userRef = collection(db, "users");
          const emailQuery = query(userRef, where("email", "==", email));
          const querySnapshot = await getDocs(emailQuery);
          if (querySnapshot.empty) {
            throw new Error("No user found with this email.");
          }

          const userData = querySnapshot.docs[0].data();
          set((state) => ({
            userInfo: { ...state.userInfo, role: userData.role },
          }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    {
      name: "storage",
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);

onAuthStateChanged(auth, (user) => {
  saveToken(user);
});

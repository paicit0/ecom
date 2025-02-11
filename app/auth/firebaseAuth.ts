//firebaseAuth.ts
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";
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
  connectFirestoreEmulator,
} from "firebase/firestore";

// auth initialize configs
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

if (
  process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev" &&
  process.env.EXPO_PUBLIC_AUTH_EMULATOR
) {
  connectAuthEmulator(auth, process.env.EXPO_PUBLIC_AUTH_EMULATOR);
  console.log("firebaseAuth: Connected to Firebase Auth Emulator");
  connectFirestoreEmulator(db, "10.0.2.2", 8080);
  console.log("firebaseAuth: Connected to Firebase Firestore Emulator");
}

type userSessionType = {
  userIsSignedIn: boolean;
  userInfo: {
    email: string | null;
    role?: string | null;
    favorite?: [] | null;
    cart?: [] | null;
  };
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  getUserInfo: (email: string | null) => void;
  refreshToken: (user: User | null) => void;
};

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

export const useUserSession = create<userSessionType>()(
  persist(
    (set) => ({
      userInfo: { email: "", role: "", favorite: [], cart: [] },
      userIsSignedIn: false,
      login: async (email, password) => {
        console.log("useUserSession.login: in firebaseAuth!");
        if (!email || !password) {
          console.log("useUserSession.login: No email or password received.");
          return { success: false, message: "Email and password are required" };
        }
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          // console.log(
          //   "useUserSession.login: Login User credential:",
          //   userCredential
          // );
          const userRef = collection(db, "users");
          const emailQuery = query(userRef, where("email", "==", email));
          const querySnapshot = await getDocs(emailQuery);
          if (querySnapshot.empty) {
            throw new Error(
              "useUserSession.login: No user found with this email."
            );
          }

          const userData = querySnapshot.docs[0].data();
          console.log("useUserSession.login: User data retrieved:", userData);
          set({ userIsSignedIn: true });
          set({
            userInfo: {
              email: email,
              role: userData.role,
              favorite: userData.favorite,
              cart: userData.cart,
            },
          });

          return {
            success: true,
            message: "useUserSession.login: Login successful.",
          };
        } catch (error) {
          console.error("useUserSession.login: Login failed:", error);
          return { success: false, message: `useUserSession.login: ${error}` };
        }
      },

      logout: async () => {
        try {
          console.log("useUserSession.logout: Setting userIsSignedIn to false");
          set({ userIsSignedIn: false });
          console.log("useUserSession.logout: Setting userInfo to default");
          set({ userInfo: { email: "", role: null, favorite: [], cart: [] } });
          await auth.signOut();
          return {
            success: true,
            message: "useUserSession.logout: Logout successful.",
          };
        } catch (error) {
          console.error("useUserSession.logout: Logout failed:", error);
          return { success: true, message: `useUserSession.logout: ${error}` };
        }
      },
      getUserInfo: async (email) => {
        try {
          const userRef = collection(db, "users");
          const emailQuery = query(userRef, where("email", "==", email));
          const querySnapshot = await getDocs(emailQuery);
          if (querySnapshot.empty) {
            throw new Error("No user found with this email.");
          }

          const userData = querySnapshot.docs[0].data();
          set((state) => ({
            userInfo: {
              ...state.userInfo,
              role: userData.role,
              favorite: userData.favorite,
              cart: userData.cart,
            },
          }));
        } catch (error) {
          console.log("useUserSession.getUserInfo:", error);
        }
      },
      refreshToken: async (user: User | null) => {
        saveToken(user);
      },
    }),
    {
      name: "storage",
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);
async function saveToken(user: User | null) {
  try {
    if (user) {
      console.log("firebaseAuth.saveToken: Attempting to get ID token...");
      const token = await user.getIdToken(true);
      console.log("firebaseAuth.saveToken: Generating a tokenID: ", token);
      await SecureStore.setItemAsync("authToken", token);
    } else {
      await SecureStore.deleteItemAsync("authToken");
    }
  } catch (error) {
    console.error("useUserSession.saveToken:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  console.log(
    "firebaseAuth.saveToken: onAuthStateChanged triggered:",
    user?.email
  );
  saveToken(user);
});

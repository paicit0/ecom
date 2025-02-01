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
  console.log("Connected to Firebase Auth Emulator");
  connectFirestoreEmulator(db, '10.0.2.2', 8080);
  console.log("Connected to Firebase Firestore Emulator");
}

type userSessionType = {
  userIsSignedIn: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  getUserInfo: (email: string | null) => void;
  userInfo: {
    email: string | null;
    role?: string | null;
    favorite?: [] | null;
    cart?: [] | null;
  };
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
        console.log(
          "useUserSession.login: Auth Emulator Host:",
          process.env.EXPO_PUBLIC_AUTH
        );
        console.log("useUserSession.login: Current Auth Instance:", auth);
        if (!email || !password) {
          console.log("useUserSession.login: No email or password received.");
          return;
        }
        console.log("useUserSession.login: before try block");
        try {
          console.log("useUserSession.login try block");
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          console.log(
            "useUserSession.login: Login User credential:",
            userCredential
          );
          console.log("useUserSession.login: ref block");
          const userRef = collection(db, "users");
          const emailQuery = query(userRef, where("email", "==", email));
          const querySnapshot = await getDocs(emailQuery);
          console.log("useUserSession.login query block");

          if (querySnapshot.empty) {
            throw new Error(
              "useUserSession.login: No user found with this email."
            );
          }

          const userData = querySnapshot.docs[0].data();
          console.log("useUserSession.login: User data retrieved:", userData);
          console.log("useUserSession.login: Setting userIsSignedIn to true");
          set({ userIsSignedIn: true });
          set({
            userInfo: {
              email: email,
              role: userData.role,
              favorite: userData.favorite,
              cart: userData.cart,
            },
          });
          console.log(
            "useUserSession.login: Saving userIsSignedIn to SecureStorage"
          );
          SecureStorage.setItem("useUserSession.login: userIsSignedIn", "true");
          await saveToken(userCredential.user);
        } catch (error: any) {
          console.error("useUserSession.login: Login failed:", error.message);
        }
      },

      logout: async () => {
        try {
          console.log(
            "useUserSession.logout: Removing userIsSignedIn from SecureStorage"
          );
          SecureStorage.removeItem("userIsSignedIn");
          console.log("useUserSession.logout: Setting userIsSignedIn to false");
          set({ userIsSignedIn: false });
          console.log("useUserSession.logout: Setting userInfo to default");
          set({ userInfo: { email: "", role: null, favorite: [], cart: [] } });
          await auth.signOut();
          await SecureStore.deleteItemAsync("authToken");
        } catch (error) {
          console.error("useUserSession.logout: Logout failed:", error);
        }
      },

      /**
       * Retrieves user information (role, favorite, cart) from the database based on the given email.
       * Updates the userInfo state with the retrieved data.
       * @param email The user's email.
       */

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
      const token = await user.getIdToken();
      await SecureStore.setItemAsync("authToken", token);
    } else {
      await SecureStore.deleteItemAsync("authToken");
    }
  } catch (error) {
    console.error("useUserSession.saveToken:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  saveToken(user);
});

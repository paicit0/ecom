import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

interface userSessionType {
  userIsSignedIn: boolean;
  login: () => void;
  logout: () => void;
  storeEmail: (string: string) => void;
  email: string;
  userInfo: [];
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

export const useUserSession = create<userSessionType>()(
  persist(
    (set) => ({
      userInfo: [],
      userIsSignedIn: false,
      email: "",
      login: async () => {
        console.log("Saving userIsSignedIn to SecureStorage");
        SecureStorage.setItem("userIsSignedIn", "true");
        console.log("Setting userIsSignedIn to true");
        set({ userIsSignedIn: true });
      },

      logout: async () => {
        console.log("Removing userIsSignedIn from SecureStorage");
        SecureStorage.removeItem("userIsSignedIn");
        console.log("Setting userIsSignedIn to false");
        set({ userIsSignedIn: false });
      },
      storeEmail: (email: string) => set({ email }),
    }),
    {
      name: "storage",
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);

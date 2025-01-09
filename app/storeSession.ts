import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

interface userSessionType {
  userIsSignedIn: boolean;
  login: () => void;
  logout: () => void;
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
}

export const useUserSession = create<userSessionType>()(
  persist(
    (set) => ({
      userIsSignedIn: false,
      login: () => set({ userIsSignedIn: true }),
      logout: () => set({ userIsSignedIn: false }),
    }),
    {
      name: "storage",
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);

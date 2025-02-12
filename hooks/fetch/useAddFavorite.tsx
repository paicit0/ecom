import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useQuery, useMutation } from "@tanstack/react-query";

const fetchAddFavorite = async (email: string, productId: string) => {
  try {
    if (!email) throw new Error("User email is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const addFavoriteUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_addFavorite_emulator
        : process.env.EXPO_PUBLIC_addFavorite_prod;

    if (!addFavoriteUrl) throw new Error("addFavoriteUrl not found");
    console.log("useAddFavorite: payload:", email, productId);

    const { data } = await axios.post(
      addFavoriteUrl,
      { email, productId },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("useAddFavorite: ", error);
  }
};

export const useAddFavorite = (email: string, productId: string) => {
  return useMutation({
    mutationFn: () => fetchAddFavorite(email, productId),
  });
};

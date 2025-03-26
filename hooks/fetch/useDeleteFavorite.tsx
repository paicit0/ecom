// useDeleteFavorite.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type fetchDeleteFavoriteType = {
  userEmail: string;
  productId: string;
};

type fetchDeleteFavoriteResponseSuccess = {
  message: string;
}
type fetchDeleteFavoriteResponseFailed = {
  error: string;
}

type fetchDeleteFavoriteResponseType = 
  | fetchDeleteFavoriteResponseSuccess 
  | fetchDeleteFavoriteResponseFailed 

const fetchDeleteFavorite = async ({
  userEmail,
  productId,
}: fetchDeleteFavoriteType): Promise<fetchDeleteFavoriteResponseType> => {
  try {
    if (!userEmail) throw new Error("User userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const deleteFavoriteUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_deleteFavorite_emulator
        : process.env.EXPO_PUBLIC_deleteFavorite_prod;

    if (!deleteFavoriteUrl) throw new Error("deleteFavoriteUrl not found");
    console.log("useDeleteFavorite: payload:", userEmail, productId);

    const { data } = await axios.post(
      deleteFavoriteUrl,
      { userEmail, productId },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("usedeleteFavorite: ", error);
    throw error;
  }
};

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userEmail, productId }: fetchDeleteFavoriteType) =>
      fetchDeleteFavorite({ userEmail, productId }),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  })
  ;
};

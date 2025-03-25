// useAddFavorite.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type fetchAddFavoriteType = {
  userEmail: string;
  productId: string;
};

type fetchAddFavoriteResponseSuccess = {
  message: string;
};
type fetchAddFavoriteResponseFailed = {
  error: string;
};

type fetchAddFavoriteResponseType =
  | fetchAddFavoriteResponseSuccess
  | fetchAddFavoriteResponseFailed;

const fetchAddFavorite = async ({
  userEmail,
  productId,
}: fetchAddFavoriteType): Promise<fetchAddFavoriteResponseType> => {
  try {
    if (!userEmail) throw new Error("User userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const addFavoriteUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_addFavorite_emulator
        : process.env.EXPO_PUBLIC_addFavorite_prod;

    if (!addFavoriteUrl) throw new Error("addFavoriteUrl not found");
    console.log("useAddFavorite: payload:", userEmail, productId);

    const { data } = await axios.post(
      addFavoriteUrl,
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
    console.error("useAddFavorite: ", error);
    throw error;
  }
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userEmail, productId }: fetchAddFavoriteType) =>
      fetchAddFavorite({ userEmail, productId }),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

// useCreateFavorite.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type fetchCreateFavoriteType = {
  userEmail: string;
  productId: string;
};

type fetchCreateFavoriteResponseSuccess = {
  message: string;
};
type fetchCreateFavoriteResponseFailed = {
  error: string;
};

type fetchCreateFavoriteResponseType =
  | fetchCreateFavoriteResponseSuccess
  | fetchCreateFavoriteResponseFailed;

const fetchCreateFavorite = async ({
  userEmail,
  productId,
}: fetchCreateFavoriteType): Promise<fetchCreateFavoriteResponseType> => {
  try {
    if (!userEmail) throw new Error("User userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const createFavoriteUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_createFavorite_emulator
        : process.env.EXPO_PUBLIC_createFavorite_prod;

    if (!createFavoriteUrl) throw new Error("createFavoriteUrl not found");
    console.log("useCreateFavorite: payload:", userEmail, productId);

    const { data } = await axios.post(
      createFavoriteUrl,
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
    console.error("useCreateFavorite: ", error);
    throw error;
  }
};

export const useCreateFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userEmail, productId }: fetchCreateFavoriteType) =>
      fetchCreateFavorite({ userEmail, productId }),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

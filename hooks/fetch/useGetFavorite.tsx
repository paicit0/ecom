// useGetFavorite.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Product } from "../../app/store/store";

type fetchFavoritesType = {
  userEmail: string;
};

const fetchFavorites = async ({
  userEmail,
}: fetchFavoritesType): Promise<Product[]> => {
  try {
    if (!userEmail) throw new Error("userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const getFavoriteUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_getFavorite_emulator
        : process.env.EXPO_PUBLIC_getFavorite_prod;

    if (!getFavoriteUrl) throw new Error("API URL not found");

    console.log("useGetFavorite: payload", userEmail);

    const { data } = await axios.get(getFavoriteUrl, {
      params: { userEmail: userEmail },
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    return data.favoriteProducts;
  } catch (error) {
    console.error("useGetFavorite: ", error);
    throw error;
  }
};

export const useGetFavorite = ({ userEmail }: fetchFavoritesType) => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => fetchFavorites({ userEmail }),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

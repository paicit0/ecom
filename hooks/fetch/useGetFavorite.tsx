import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const fetchFavorites = async (email: string) => {
  if (!email) throw new Error("User email is required");

  const idToken = await SecureStore.getItemAsync("authToken");
  const getFavoriteUrl =
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
      ? process.env.EXPO_PUBLIC_getFavorite_emulator
      : process.env.EXPO_PUBLIC_getFavorite_prod;

  if (!getFavoriteUrl) throw new Error("API URL not found");

  const { data } = await axios.get(getFavoriteUrl, {
    params: { email },
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const useGetFavorite = (userEmail: string) => {
  return useQuery({
    queryKey: ["favorites", userEmail],
    queryFn: () => fetchFavorites(userEmail),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};


// useGetCart.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Product } from "../../app/store/store";

type fetchCartType = {
  userEmail: string;
};

const fetchCart = async ({ userEmail }: fetchCartType): Promise<Product[]> => {
  try {
    if (!userEmail) throw new Error("User email is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const getCartUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_getCart_emulator
        : process.env.EXPO_PUBLIC_getCart_prod;

    if (!getCartUrl) throw new Error("API URL not found");

    console.log("useGetCart: payload", userEmail);

    const { data } = await axios.get(getCartUrl, {
      params: { userEmail: userEmail },
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("useGetCart: data.CartProducts", data.cartProducts)
    return data.cartProducts;
  } catch (error) {
    console.error("useGetCart: ", error);
    throw error;
  }
};

export const useGetCart = ({ userEmail }: fetchCartType) => {
  return useQuery({
    queryKey: ["Cart"],
    queryFn: () => fetchCart({ userEmail }),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

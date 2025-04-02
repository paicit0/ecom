// useGetCart.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Product } from "../../store/store";

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
    if (data.CartProducts) {
      console.log(
        "useGetCart: data.CartProducts[0].id",
        data.cartProducts[0].id
      );
    }

    return data.cartProducts;
  } catch (error: any) {
    if (error.response) {
      console.error("useGetCart: error.response.status", error.response.status);
      throw error.response.status;
    }
    console.error("useGetCart: error", error);
    throw error;
  }
};

export const useGetCart = ({ userEmail }: fetchCartType) => {
  return useQuery({
    queryKey: ["cart", userEmail],
    queryFn: () => fetchCart({ userEmail }),
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

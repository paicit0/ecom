// useAddCart.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation } from "@tanstack/react-query";

type fetchAddCartType = {
  userEmail: string;
  productId: string;
};

type fetchAddCartResponseSuccess = {
  message: string;
}
type fetchAddCartResponseFailed = {
  error: string;
}

type fetchAddCartResponseType = 
  | fetchAddCartResponseSuccess 
  | fetchAddCartResponseFailed 

const fetchAddCart = async ({
  userEmail,
  productId,
}: fetchAddCartType): Promise<fetchAddCartResponseType> => {
  try {
    if (!userEmail) throw new Error("User userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const addCartUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_addCart_emulator
        : process.env.EXPO_PUBLIC_addCart_prod;

    if (!addCartUrl) throw new Error("addCartUrl not found");
    console.log("useAddCart: payload:", userEmail, productId);

    const { data } = await axios.post(
      addCartUrl,
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
    console.error("useAddCart: ", error);
    throw error;
  }
};

export const useAddCart = () => {
  return useMutation({
    mutationFn: ({ userEmail, productId }: fetchAddCartType) =>
      fetchAddCart({ userEmail, productId }),
  });
};

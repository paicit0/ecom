// useCreateCart.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { debounce } from "lodash";

type fetchCreateCartType = {
  userEmail: string;
  productId: string;
};

type fetchCreateCartResponseSuccess = {
  message: string;
};
type fetchCreateCartResponseFailed = {
  error: string;
};

type fetchCreateCartResponseType =
  | fetchCreateCartResponseSuccess
  | fetchCreateCartResponseFailed;

const fetchCreateCart = async ({
  userEmail,
  productId,
}: fetchCreateCartType): Promise<fetchCreateCartResponseType> => {
  try {
    if (!userEmail) throw new Error("User userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const createCartUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_createCart_emulator
        : process.env.EXPO_PUBLIC_createCart_prod;

    if (!createCartUrl) throw new Error("createCartUrl not found");
    console.log("usecreateCart: payload:", userEmail, productId);

    const { data } = await axios.post(
      createCartUrl,
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
    console.error("usecreateCart: ", error);
    throw error;
  }
};

export const useCreateCart = (debounceTime = 500) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: fetchCreateCart,
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return mutation;
};

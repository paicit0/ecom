// useDeleteCart.tsx
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type fetchDeleteCartType = {
  userEmail: string;
  productId: string;
};

type fetchDeleteCartResponseSuccess = {
  message: string;
};
type fetchDeleteCartResponseFailed = {
  error: string;
};

type fetchDeleteCartResponseType =
  | fetchDeleteCartResponseSuccess
  | fetchDeleteCartResponseFailed;

const fetchDeleteCart = async ({
  userEmail,
  productId,
}: fetchDeleteCartType): Promise<fetchDeleteCartResponseType> => {
  try {
    if (!userEmail) throw new Error("userEmail is required");

    const idToken = await SecureStore.getItemAsync("authToken");
    const deleteCartUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_deleteCart_emulator
        : process.env.EXPO_PUBLIC_deleteCart_prod;

    if (!deleteCartUrl) throw new Error("deleteCartUrl not found");
    console.log("useDeleteCart: payload:", userEmail, productId);

    const { data } = await axios.post(
      deleteCartUrl,
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
    console.error("usedeleteCart: ", error);
    throw error;
  }
};

export const useDeleteCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userEmail, productId }: fetchDeleteCartType) =>
      fetchDeleteCart({ userEmail, productId }),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

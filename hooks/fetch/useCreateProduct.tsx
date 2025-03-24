import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { Product } from "../../store/store";

type fetchCreateProductResponseSuccess = {
  message: string;
}
type fetchCreateProductResponseFailed = {
  error: string;
}

type fetchCreateProductResponseType = 
  | fetchCreateProductResponseSuccess 
  | fetchCreateProductResponseFailed 


const fetchCreateProduct = async ({
  productName,
  productPrice,
  productDescription,
  productCategory,
  productImageUrl,
  productThumbnailUrl,
  productStock,
  productOwner,
}: Product): Promise<fetchCreateProductResponseType> => {
  if (
    !productName ||
    !productPrice ||
    !productImageUrl ||
    !productThumbnailUrl ||
    !productOwner
  ) {
    throw new Error("Required product fields are missing");
  }
  const idToken = await SecureStore.getItemAsync("authToken");
  const createProductUrl =
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
      ? process.env.EXPO_PUBLIC_createProduct_emulator
      : process.env.EXPO_PUBLIC_createProduct_prod;

  if (!createProductUrl) {
    console.log("fetchCreateProduct: createProductUrl not found!");
    throw new Error("API URL not found");
  }
  try {
    const { data } = await axios.post(
      createProductUrl,
      {
        productName,
        productPrice,
        productDescription,
        productCategory,
        productImageUrl,
        productThumbnailUrl,
        productStock,
        productOwner,
      },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.error("fetchCreateProduct error: ", error);
    throw error;
  }
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: ({
      productId,
      productName,
      productPrice,
      productDescription,
      productCategory,
      productImageUrl,
      productThumbnailUrl,
      productStock,
      productOwner,
    }: Product) =>
      fetchCreateProduct({
        productId,
        productName,
        productPrice,
        productDescription,
        productCategory,
        productImageUrl,
        productThumbnailUrl,
        productStock,
        productOwner,
      }),
  });
};

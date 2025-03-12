// useGetFavorite.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "../../app/store/store";

type fetchGetProductsType = {
  numberOfItems: number;
  currentProductNumber: number;
};

const fetchGetProducts = async ({
  numberOfItems,
  currentProductNumber,
}: fetchGetProductsType): Promise<Product[]> => {
  try {
    const getProductsUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_getProducts_emulator
        : process.env.EXPO_PUBLIC_getProducts_prod;

    if (!getProductsUrl) throw new Error("API URL not found");
    console.log(
      "useGetProducts: payload:",
      numberOfItems,
      currentProductNumber
    );
    const { data } = await axios.get(getProductsUrl, {
      params: {
        numberOfItems: numberOfItems,
        currentProductNumber: currentProductNumber,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data.productsData;
  } catch (error) {
    console.error("useGetProducts: ", error);
    throw error;
  }
};

export const useGetProducts = ({
  numberOfItems,
  currentProductNumber,
}: fetchGetProductsType) => {
  return useQuery({
    queryKey: ["products", numberOfItems, currentProductNumber],
    queryFn: () =>
      fetchGetProducts({
        numberOfItems,
        currentProductNumber,
      }),
    staleTime: 0.5 * 60 * 1000, // ms
    refetchOnWindowFocus: true,
  });
};

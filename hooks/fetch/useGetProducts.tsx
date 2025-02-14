// useGetFavorite.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type fetchGetProductsType = {
  numberOfItems: number;
  currentProductNumber: number;
};

const fetchGetProducts = async ({
  numberOfItems,
  currentProductNumber,
}: fetchGetProductsType) => {
  try {
    const getProducts =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_getProducts_emulator
        : process.env.EXPO_PUBLIC_getProducts_prod;

    if (!getProducts) throw new Error("API URL not found");
    console.log(
      "useGetProducts: payload:",
      numberOfItems,
      currentProductNumber
    );
    const { data } = await axios.get(getProducts, {
      params: {
        numberOfItems: numberOfItems,
        currentProductNumber: currentProductNumber,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    console.error("useGetProducts: ", error);
    throw error;
  }
};

/******  a95ab75e-9956-4c52-8f04-74b720eb8443  *******/
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
    staleTime: 0.5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

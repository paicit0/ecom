// store.ts
import { create } from "zustand";

type cartItems = {
  id: string;
  quantity: number;
};

type useCartType = {
  cartItemsArray: cartItems[];
  addToCart: (itemId: string) => void;
  deleteFromCart: (itemId: string) => void;
  deleteAllCart: () => void;
};

export const useCart = create<useCartType>((set) => ({
  cartItemsArray: [],
  addToCart: (itemId) =>
    set((state) => {
      const existingItemIndex = state.cartItemsArray.findIndex(
        (item) => item.id === itemId
      );

      if (existingItemIndex !== -1) {
        const updatedCartItems = state.cartItemsArray.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log("store.useCart:: Current CartItems", updatedCartItems);
        return { cartItemsArray: updatedCartItems };
      } else {
        const updatedCartItems = [
          ...state.cartItemsArray,
          { id: itemId, quantity: 1 },
        ];
        console.log("store.useCart: Adding to Cart: " + itemId);
        console.log("store.useCart: Current CartItems", updatedCartItems);
        return { cartItemsArray: updatedCartItems };
      }
    }),
  deleteFromCart: (itemId) =>
    set((state) => {
      const updatedCartItems = state.cartItemsArray.filter(
        (item) => item.id !== itemId
      );
      console.log("store.useCart: Removing from Cart: " + itemId);
      console.log("store.useCart: Current CartItems", updatedCartItems);
      return { cartItemsArray: updatedCartItems };
    }),
  deleteAllCart: () =>
    set(() => {
      console.log("store.useCart: Clearing Cart");
      return { cartItemsArray: [] };
    }),
}));

export type Product = {
  productId: string;
  productName: string;
  productDescription: string;
  productCategory: string;
  productPrice: number;
  productImageUrlArray: string[];
  productThumbnailUrlArray: string[];
  productStock: number;
  productOwner: string;
  productCartQuantity?: number;
};
type ProductStore = {
  products: Product[];
  setProducts: (newProducts: Product[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (newProducts: Product[]) => set({ products: newProducts }),
}));

type useFavoriteType = {
  favoriteItemsArray: string[];
  addToFavorite: (itemId: string) => void;
  deleteFromFavorite: (itemId: string) => void;
  deleteAllFavorite: () => void;
  isFavorited: (itemId: string) => boolean;
};

export const useFavorite = create<useFavoriteType>((set, get) => ({
  favoriteItemsArray: [],
  addToFavorite: (itemId) =>
    set((state) => {
      if (state.favoriteItemsArray.includes(itemId)) {
        console.log("Duplicated Item in Favorite!!");
        return state;
      }
      const updatedFavoriteItems = [...state.favoriteItemsArray, itemId];
      console.log("store.useFavorite: Adding to Favorite: " + itemId);
      console.log(
        "store.useFavorite: Current FavoriteItems",
        updatedFavoriteItems
      );
      return { favoriteItemsArray: updatedFavoriteItems };
    }),
  deleteFromFavorite: (itemId) =>
    set((state) => {
      const updatedFavoriteItems = state.favoriteItemsArray.filter(
        (item) => item !== itemId
      );
      console.log("store.useFavorite: Removing from favorite: " + itemId);
      console.log(
        "store.useFavorite: Current FavoriteItems",
        updatedFavoriteItems
      );
      return {
        favoriteItemsArray: updatedFavoriteItems,
      };
    }),
  isFavorited: (itemId) => get().favoriteItemsArray.includes(itemId),
  deleteAllFavorite: () => set({ favoriteItemsArray: [] }),
}));

export const favoriteItemArray = () =>
  useFavorite((state) => state.favoriteItemsArray);

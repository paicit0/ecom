// store.ts
import { create } from "zustand";

export type Product = {
  id: string;
  productName: string;
  productDescription: string;
  productCategory: string;
  productPrice: number;
  productImageUrl: string;
  productThumbnailUrl: string;
  productStock: number | string;
  productOwner: string;
};

export type CartItem = {
  id: string;
};

type useCartArray = {
  cartItems: CartItem[];
  addCart: (item: CartItem) => void;
  deleteCart: (index: number) => void;
  deleteAllCart: () => void;
};

export const useCart = create<useCartArray>((set) => ({
  cartItems: [],
  addCart: (item) =>
    set((state) => ({ cartItems: [...state.cartItems, item] })),
  deleteCart: (index) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item, i) => i !== index),
    })),
  deleteAllCart: () => set({ cartItems: [] }),
}));

type ProductStore = {
  products: Product[];
  setProducts: (newProducts: Product[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (newProducts: Product[]) => set({ products: newProducts }),
}));

type useFavoriteArray = {
  favoriteItems: string[];
  addFavorite: (itemId: string) => void;
  deleteFavorite: (itemId: string) => void;
  deleteAllFavorite: () => void;
  isFavorited: (itemId: string) => boolean;
};

export const useFavorite = create<useFavoriteArray>((set, get) => ({
  favoriteItems: [],
  addFavorite: (itemId) =>
    set((state) => {
      if (state.favoriteItems.includes(itemId)) {
        console.log("Duplicated Item!");
        return state;
      }
      const updatedFavoriteItems = [...state.favoriteItems, itemId];
      console.log("Adding to favorite: " + itemId);
      console.log("Current FavoriteItems", updatedFavoriteItems);
      return { favoriteItems: updatedFavoriteItems };
    }),
  deleteFavorite: (itemId) =>
    set((state) => {
      const updatedFavoriteItems = state.favoriteItems.filter(
        (item) => item !== itemId
      );
      console.log("Removing from favorite: " + itemId);
      console.log("Current FavoriteItems", updatedFavoriteItems);
      return {
        favoriteItems: updatedFavoriteItems,
      };
    }),
  deleteAllFavorite: () => set({ favoriteItems: [] }),
  isFavorited: (itemId) => new Set(get().favoriteItems).has(itemId),
}));

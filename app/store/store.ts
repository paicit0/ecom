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
  productName: string;
  productPrice: number;
  productThumbnailUrl: string;
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

export type FavoriteItem = {
  id: string;
  productName: string;
  productPrice: number;
  productThumbnailUrl: string;
};

type useFavoriteArray = {
  favoriteItems: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  deleteFavorite: (index: number) => void;
  deleteAllFavorite: () => void;
};

export const useFavorite = create<useFavoriteArray>((set) => ({
  favoriteItems: [],
  addFavorite: (item) =>
    set((state) => ({ favoriteItems: [...state.favoriteItems, item] })),
  deleteFavorite: (index) =>
    set((state) => ({
      favoriteItems: state.favoriteItems.filter((item, i) => i !== index),
    })),
  deleteAllFavorite: () => set({ favoriteItems: [] }),
}));

// store.ts
import { create } from "zustand";

export type Product = {
  stock: number;
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
};

export interface CartItem {
  price: number;
  title: string;
  id: number;
  images: string[];
}

interface useCartArray {
  cartItems: CartItem[];
  addCart: (item: CartItem) => void;
  deleteCart: (index: number) => void;
  deleteAllCart: () => void;
}

interface ProductStore {
  products: Product[];
  setProducts: (newProducts: CartItem[]) => void;
}

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

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (newProducts: any) => set({ products: newProducts }),
}));

interface useFavoriteArray {
  favoriteItems: CartItem[];
  addFavorite: (item: CartItem) => void;
  deleteFavorite: (index: number) => void;
  deleteAllFavorite: () => void;
}

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

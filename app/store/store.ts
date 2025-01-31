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

type cartItems = {
  id: string;
  quantity: number;
};

type useCartArray = {
  cartItems: cartItems[];
  addToCart: (itemId: string) => void;
  deleteFromCart: (itemId: string) => void;
  deleteAllCart: () => void;
};

export const useCart = create<useCartArray>((set) => ({
  cartItems: [],
  addToCart: (itemId) =>
    set((state) => {
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === itemId
      );

      if (existingItemIndex !== -1) {
        const updatedCartItems = state.cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log("Increasing quantity for item: " + itemId);
        console.log("Current CartItems", updatedCartItems);
        return { cartItems: updatedCartItems };
      } else {
        const updatedCartItems = [
          ...state.cartItems,
          { id: itemId, quantity: 1 },
        ];
        console.log("Adding to Cart: " + itemId);
        console.log("Current CartItems", updatedCartItems);
        return { cartItems: updatedCartItems };
      }
    }),
  deleteFromCart: (itemId) =>
    set((state) => {
      const updatedCartItems = state.cartItems.filter(
        (item) => item.id !== itemId
      );
      console.log("Removing from Cart: " + itemId);
      console.log("Current CartItems", updatedCartItems);
      return { cartItems: updatedCartItems };
    }),
  deleteAllCart: () =>
    set(() => {
      console.log("Clearing Cart");
      return { cartItems: [] };
    }),
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
  addToFavorite: (itemId: string) => void;
  deleteFromFavorite: (itemId: string) => void;
  deleteAllFavorite: () => void;
  isFavorited: (itemId: string) => boolean;
};

export const useFavorite = create<useFavoriteArray>((set, get) => ({
  favoriteItems: [],
  addToFavorite: (itemId) =>
    set((state) => {
      if (state.favoriteItems.includes(itemId)) {
        console.log("Duplicated Item in Favorite!!");
        return state;
      }
      const updatedFavoriteItems = [...state.favoriteItems, itemId];
      console.log("Adding to Favorite: " + itemId);
      console.log("Current FavoriteItems", updatedFavoriteItems);
      return { favoriteItems: updatedFavoriteItems };
    }),
  deleteFromFavorite: (itemId) =>
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

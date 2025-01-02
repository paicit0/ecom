import { create } from 'zustand';
import { CartItem, Product } from './type/types';

interface useCartArray {
    cartItems: CartItem[];
    addItem: (item:CartItem) => void;
    deleteItem: (index:number) => void;
    deleteAll: () => void;
}

interface ProductStore {
    products: Product[];
    setProducts: (newProducts: CartItem[]) => void;
  }

export const useCart = create<useCartArray>((set) => ({
    cartItems: [],
    addItem: (item) => set((state) => ({ cartItems: [...state.cartItems, item] })),
    deleteItem: (index) => set((state) => ({ cartItems: state.cartItems.filter((item, i) => i !== index) })),
    deleteAll: () => set({ cartItems: [] })
    
}))

export const useProductStore = create<ProductStore>((set) => ({
    products: [],
    setProducts: (newProducts: any) => set({ products: newProducts }),
  })); 

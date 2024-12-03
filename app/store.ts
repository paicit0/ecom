import { create } from 'zustand';

interface useCartArray {
    cartItems: string[];
    addItem: (item:string) => void;
    deleteItem: (index:number) => void;
}

export const useCart = create<useCartArray>((set) => ({
    cartItems: [],
    addItem: (item) => set((state) => ({ cartItems: [...state.cartItems, item] })),
    deleteItem: (index) => set((state) => ({ cartItems: state.cartItems.filter((item, i) => i !== index) })),
    
}))

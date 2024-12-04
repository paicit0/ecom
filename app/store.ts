import { create } from 'zustand';

interface CartItem {
    name: string;
    id: number;
    sprite: string;
}

interface useCartArray {
    cartItems: CartItem[];
    addItem: (item:CartItem) => void;
    deleteItem: (index:number) => void;
    deleteAll: () => void;
}

export const useCart = create<useCartArray>((set) => ({
    cartItems: [],
    addItem: (item) => set((state) => ({ cartItems: [...state.cartItems, item] })),
    deleteItem: (index) => set((state) => ({ cartItems: state.cartItems.filter((item, i) => i !== index) })),
    deleteAll: () => set((state) => ({ cartItems: state.cartItems = [] }))
    
}))

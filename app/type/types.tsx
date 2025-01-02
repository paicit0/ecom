export type Product = {
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

import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

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

export type RootStackParamList = {
  HomeScreen: undefined;
  ItemScreen: { item: Product };
  CartScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HomeScreen"
>;
export type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CartScreen"
>;
export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LoginScreen"
>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RegisterScreen"
>;

import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";


export type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  stats?: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  types?: Array<{
    type: {
      name: string;
    };
  }>;
  abilities?: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
}

export interface CartItem {
  name: string;
  id: number;
  sprite: string;
}

export type RootStackParamList = {
  HomeScreen: undefined;
  ItemScreen: { item: Pokemon };
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

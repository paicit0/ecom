import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

export interface Pokemon {
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

export type RootStackParamList = {
  HomeScreen: undefined;
  ItemScreen: { item: Pokemon };
  CartScreen: undefined;
};

export interface PokemonCart {
  id: number,
  name: string,
  quantity: number
}

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;
export type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CartScreen'>;
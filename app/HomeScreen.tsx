import React, { memo, useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { Image } from "react-native";
import SearchBar from "@/components/SearchBar";
import { Pokemon, PokemonCart } from "./type/types";
import { HomeScreenNavigationProp } from "./type/types";

const fetchPokemonData = async (): Promise<Pokemon[]> => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
  const data = await response.json();

  const detailedPokemons = await Promise.all(
    data.results.map(async (pokemon: { url: string }) => {
      const response2 = await fetch(pokemon.url);
      return response2.json();
    })
  );

  return detailedPokemons;
};

export const HomeScreen = memo(function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<PokemonCart[]>([]);
  // console.log('Current Cart: ' + cartItems);

  useEffect(() => {
    const getPokemons = async () => {
      try {
        const data = await fetchPokemonData();
        setPokemons(data);
        setFilteredPokemons(data);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getPokemons();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = pokemons.filter(
      pokemon => pokemon.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPokemons(filtered);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderItem = ({ item }: { item: Pokemon }) => (
    <Pressable
      style={styles.itemContainer}
      onPress={() => navigation.navigate("ItemScreen", { item })}
    >
      <View style={styles.cardContent}>
        <Image
          style={styles.imageItem}
          source={{ uri: item.sprites.front_default }}
        />
        <Text style={styles.textItemName}>
          {capitalizeFirstLetter(item.name)}
        </Text>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokéshop</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search Pokémon..."
        />
      </View>
      <FlatList
        data={filteredPokemons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  container: {
    padding: 8,
  },
  itemContainer: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
  },
  imageItem: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  textItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
});

export default HomeScreen;
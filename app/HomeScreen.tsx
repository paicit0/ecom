import React, { memo, useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "react-native";
import SearchBar from "@/components/SearchBar";
import { Pokemon } from "./type/types";
import { HomeScreenNavigationProp } from "./type/types";
import { useCart } from "./store";

export const HomeScreen = memo(function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPokemonData = async (): Promise<Pokemon[]> => {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
    const data = await response.json();

    const detailedPokemons = await Promise.all(
      data.results.map(async (pokemon: { url: string }) => {
        const response2 = await fetch(pokemon.url);
        const pokemonData = await response2.json();
        return { ...pokemonData, price: Math.floor(Math.random() * 100) };
      })
    );

    return detailedPokemons;
  };

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
    const filtered = pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPokemons(filtered);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderItem = ({ item }: { item: Pokemon }) => {
    const lowerName = item.name.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerName.indexOf(lowerQuery);

    let nameDisplay;

    if (index >= 0 && searchQuery) {
      const before = item.name.slice(0, index);
      const match = item.name.slice(index, index + searchQuery.length);
      const after = item.name.slice(index + searchQuery.length);

      nameDisplay = (
        <Text style={styles.textItemName}>
          {capitalizeFirstLetter(before)}
          <Text style={[styles.textItemName, { fontWeight: "bold" }]}>
            {index === 0 ? capitalizeFirstLetter(match) : match}
          </Text>
          {after}
        </Text>
      );
    } else {
      nameDisplay = (
        <Text style={styles.textItemName}>
          {capitalizeFirstLetter(item.name)}
        </Text>
      );
    }

    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => navigation.navigate("ItemScreen", { item })}
      >
        <View style={styles.cardContent}>
          <Image
            style={styles.imageItem}
            source={{ uri: item.sprites.front_default }}
          />
          {nameDisplay}
          <Text>${item.price}</Text>
        </View>
      </Pressable>
    );
  };

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
        <View>
          <Text style={styles.title}>Pokéshop</Text>
          <Pressable onPress={() => navigation.navigate("LoginScreen")}>
            <Text>Login</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
            <Text>Register</Text>
          </Pressable>
        </View>
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
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    // flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    // flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  container: {
    padding: 8,
  },
  itemContainer: {
    flex: 1,
    margin: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 8,
    alignItems: "center",
  },
  imageItem: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  textItemName: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#333",
    marginTop: 8,
  },
});

export default HomeScreen;

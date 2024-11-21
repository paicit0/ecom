import { useNavigation } from "expo-router";
import { StyleSheet, View, Text, Pressable, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { SearchBar } from "react-native-screens";
import { TextInput, Image } from "react-native";

interface ItemProps {
  item: any;
}

const fetchPokemonData = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100"); // name and url to a more detailed page
  const data = await response.json(); // name, url

  const detailedPokemons = await Promise.all(
    data.results.map(async (pokemon: { url: string | URL | Request }) => {
      const response2 = await fetch(pokemon.url); // fetch the detailed page
      return response2.json(); // everything about the pokemon
    })
  );

  return detailedPokemons;
};

export function HomeScreen() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const getPokemons = async () => {
      const data = await fetchPokemonData();
      setPokemons(data);
    };
    getPokemons();
  }, []);

  const eachItem = ({ item }: ItemProps) => {
    // console.log(item);
    // console.log(item.sprites.front_default);
    return (
      <Pressable
        key={item.id}
        style={styles.itemContainer}
        onPress={() => navigation.navigate("ItemScreen", { item })}
      >
        <Image style={styles.imageItem} source={{ uri: item.sprites.front_default }} />
        <Text style={styles.textItemName}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <View>
        <Text>Home</Text>
        <TextInput // This is the search bar
          placeholder="Type Here..."
        />
        <Pressable onPress={() => console.log("pressed")}>
          <Text>Hey</Text>
        </Pressable>
      </View>
      <FlatList
        data={pokemons}
        renderItem={eachItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.container}
        numColumns={2}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "red",
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemContainer: {
    flex: 1,
    marginVertical: 2,
    marginHorizontal: 2,
    padding: 0,
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: "gray",
  },
  textItemName: {
    paddingTop: 2,
    paddingBottom: 20,
    paddingLeft: 10,
    textAlign: "left",
  },
  textItemPrice: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    textAlign: "left",
  },
  imageItem: {
    width: 100,
    height: 100,
  }
});

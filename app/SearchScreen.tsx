//SearchScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useProductStore } from "./store/store";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Product } from "./type/types";
import { Ionicons } from "@expo/vector-icons";

function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const product = useProductStore((state) => state.products);
  // console.log("product: ", product);

  useEffect(() => {
    const filterItem = product.filter((item) =>
      item.title.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
    if (!searchQuery) {
      setFilteredItems([]);
    } else {
      setFilteredItems(filterItem);
    }
  }, [searchQuery]);

  useEffect(() => {}, []);

  const render = ({ item }: { item: Product }) => {
    console.log("search query: ", searchQuery);
    const searchForIndex = item.title
      .toLowerCase()
      .indexOf(searchQuery.toLowerCase());
    const beforeMatch = item.title.slice(0, searchForIndex);
    const match = item.title.slice(searchForIndex, searchQuery.length);
    const afterMatch = item.title.slice(beforeMatch.length + match.length);
    // console.log(
    //   "index" + searchForIndex,
    //   " be:" + beforeMatch,
    //   " match:" + match,
    //   " after:" + afterMatch
    // );
    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.id },
        }}
        style={{padding: 10}}
      >
        <Text>
          {beforeMatch}
          <Text style={{ fontWeight: "bold", color: "black" }}>{match}</Text>
          {afterMatch}
        </Text>
      </Link>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={{ height: 45 }}></View>
      <Link href="../(tabs)/HomeScreen">
        <Ionicons name="arrow-back-outline"></Ionicons>
      </Link>
      <View style={styles.searchBarContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholder="Search Items..."
          autoFocus
          autoCapitalize="none"
        ></TextInput>
        <Pressable
          onPress={() => setSearchQuery("")}
          style={{ backgroundColor: "red" }}
        >
          <Ionicons name="close-circle-outline" size={20}></Ionicons>
        </Pressable>
        <Ionicons name="search" size={20} color="#666" style={{}} />
      </View>
      <View style={styles.flashListStyle}>
        <FlashList
          data={filteredItems}
          renderItem={render}
          keyExtractor={(item) => item.id.toString()}
          // contentContainerStyle={styles.verticalListContainer}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          horizontal={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "yellow",
  },
  flashListStyle: {
    // backgroundColor: "black",
    flex: 24,
  },
  textItemName: {
    fontSize: 16,
    fontWeight: "normal",
    textAlign: "left",
    // backgroundColor: "grey",
  },
});

export default SearchScreen;

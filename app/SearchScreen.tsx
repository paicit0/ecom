//SearchScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Dimensions } from "react-native";
import { useProductStore } from "./store/store";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Product } from "./store/store";
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

  // useEffect(() => {}, []);

  const render = ({ item }: { item: Product }) => {
    console.log("search query: ", searchQuery);
    const searchForIndex = item.title
      .toLowerCase()
      .indexOf(searchQuery.toLowerCase());
    const beforeMatch = item.title.slice(0, searchForIndex);
    const match = item.title.slice(searchForIndex, searchQuery.length);
    const afterMatch = item.title.slice(beforeMatch.length + match.length);
    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.id },
        }}
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
      <View style={{ height: 53 }}></View>
      <View style={styles.searchBarContainer}>
        <Link href="../(tabs)/HomeScreen" style={{ paddingRight: 10 }}>
          <Ionicons name="arrow-back-outline" size={20}></Ionicons>
        </Link>
        <View style={styles.input}>
          <TextInput
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholder="Search Items..."
            autoFocus
            autoCapitalize="none"
          ></TextInput>
        </View>
        <Pressable onPress={() => setSearchQuery("")} style={{ padding: 10 }}>
          <Ionicons name="close-circle-outline" size={25}></Ionicons>
        </Pressable>
        <Ionicons name="search" size={30} color="#666" style={{}} />
      </View>
      <View style={styles.flashListStyle}>
        <FlashList
          data={filteredItems}
          renderItem={render}
          keyExtractor={(item) => item.id.toString()}
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
  mainContainer: { padding: 10 },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "black",
    height: 53,
    borderWidth: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "black",
    fontWeight: "200",
    // backgroundColor: 'black'
  },
  flashListStyle: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
});

export default SearchScreen;

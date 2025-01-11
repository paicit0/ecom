//SearchScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
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

  useEffect(() => {
    const filterItem = product.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (!searchQuery) {
      setFilteredItems([]);
    } else {
      setFilteredItems(filterItem);
    }
  }, [searchQuery]);
  const render = ({ item }: { item: Product }) => {
    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.id },
        }}
      >
        <View style={styles.itemContainer}>
          <Text style={styles.textItemName}>{item.title}</Text>
        </View>
      </Link>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={{ height: 45 }}></View>
      <Link href="../(tabs)/HomeScreen">
        <Ionicons name="arrow-back-outline"></Ionicons>
      </Link>
      <TextInput
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        placeholder="Search Items..."
      ></TextInput>
      <FlashList
        data={filteredItems}
        renderItem={render}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.verticalListContainer}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={210}
        horizontal={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    margin: 2,
    backgroundColor: "white",
  },
  verticalListContainer: {
    padding: 0,
    backgroundColor: "black",
  },
  textItemName: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#333",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "left",
    backgroundColor: "red",
  },
});

export default SearchScreen;

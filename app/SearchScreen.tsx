// SearchScreen.tsx
import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Product } from "../store/store";
import { Ionicons } from "@expo/vector-icons";
import { useGetProducts } from "../hooks/fetch/useGetProducts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const getProductsQuery = useGetProducts({
    numberOfItems: 20,
    currentProductNumber: 0,
  });

  useEffect(() => {
    console.log("SearchScreen: getProductsQuery.data", getProductsQuery.data);
    if (getProductsQuery.data) {
      setTimeout(() => {
        const filterItem = getProductsQuery.data.filter((item: Product) =>
          item.productName.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        if (!searchQuery) {
          setFilteredItems([]);
        } else {
          setFilteredItems(filterItem);
        }
      }, 1000);
    }
  }, [searchQuery]);

  // clears searchQuery when leaving SearchScreen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, [])
  );

  const render = ({ item }: { item: Product }) => {
    console.log("SearchScreen: search query: ", searchQuery);
    const searchForIndex = item.productName
      .toLowerCase()
      .indexOf(searchQuery.toLowerCase());
    const beforeMatch = item.productName.slice(0, searchForIndex);
    const match = item.productName.slice(searchForIndex, searchQuery.length);
    const afterMatch = item.productName.slice(
      beforeMatch.length + match.length
    );
    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.productId },
        }}
        asChild
      >
        <Pressable>
          <Text>
            {beforeMatch}
            <Text style={{ fontWeight: "bold", color: "black" }}>{match}</Text>
            {afterMatch}
          </Text>
        </Pressable>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.searchBarContainer}>
        <Link href="../(tabs)/HomeScreen" asChild>
          <Ionicons
            name="arrow-back-outline"
            style={{ paddingRight: 10 }}
            size={20}
          />
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
          <Ionicons name="close-circle-outline" size={24} />
        </Pressable>
        <Ionicons name="search" size={24} color="#666" style={{}} />
      </View>
      <View style={styles.flashListStyle}>
        <FlashList
          data={filteredItems}
          renderItem={render}
          keyExtractor={(item) => item.productId}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          horizontal={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { padding: 10, flex: 1 },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "black",
    height: 45,
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

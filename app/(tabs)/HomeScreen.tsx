//HomeScreen.tsx
import React, { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import SearchBar from "@/components/SearchBar";
import { Product } from "../type/types";
import { Link } from "expo-router";
import { useProductStore } from "../store";
import { FlashList } from "@shopify/flash-list";

export const HomeScreen = memo(function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const fetchProductData = async (): Promise<Product[]> => {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    useProductStore.getState().setProducts(data.products);
    return data.products;
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProductData();
        const imagesToPreload = data.map((product) => product.images[0]);
        await Image.prefetch(imagesToPreload);
        setProducts(data);
        setFilteredProducts(data);

        // console.log("Filtered Products: " + JSON.stringify(filteredProducts));
      } catch (error) {
        console.error("Error fetching Products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Getting Products: " + getProducts);
    getProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const lowerName = item.title.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerName.indexOf(lowerQuery);
    let nameDisplay;

    if (index >= 0 && searchQuery) {
      const before = item.title.slice(0, index);
      const match = item.title.slice(index, index + searchQuery.length);
      const after = item.title.slice(index + searchQuery.length);

      nameDisplay = // when searched
        (
          <View style={styles.textItemName}>
            <Text numberOfLines={2} ellipsizeMode="tail">
              {before}
              <Text>{match}</Text>
              {after}
            </Text>
          </View>
        );
    } else {
      // default
      nameDisplay = (
        <View style={styles.textItemName}>
          <Text numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.itemContainer}>
        <Link
          href={{
            pathname: "/ItemScreen/[id]",
            params: { id: item.id },
          }}
          // style={{ flex: 1 }}
        >
          <View style={styles.cardContent}>
            <Image
              style={styles.imageItem}
              source={{ uri: item.images[0] }}
              contentFit="cover"
              transition={200}
            />
            <View>{nameDisplay}</View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.itemPrice}>${item.price}</Text>
              <Text style={styles.itemStock}>Stock: {item.stock}</Text>
            </View>
          </View>
        </Link>
      </View>
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
        <View style={{ height: 45 }}></View>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search Items..."
        />
      </View>
      {/* <FlashList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.horizontalListContainer}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={160}
        horizontal={true}
      /> */}
      <FlashList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.verticalListContainer}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={210}
        horizontal={false}
      />
    </View>
  );
});

const testColor = "green";
// const { width } = Dimensions.get("window");
// console.log(width);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // backgroundColor: "yellow",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    color: "#333",
    alignItems: "flex-end",
  },
  verticalListContainer: {
    padding: 0,
    backgroundColor: "black",
  },
  horizontalListContainer: {
    padding: 0,
    backgroundColor: "cyan",
  },
  itemContainer: {
    flex: 1,
    margin: 2,
    backgroundColor: "white",

  },
  cardContent: {
    padding: 10,
    backgroundColor: "blue",
  },
  imageItem: {
    aspectRatio: 1,
    height: 150,
    width: 150,
    backgroundColor: "green",
    resizeMode: "contain",
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
  itemPrice: {
    textAlign: "left",
    backgroundColor: testColor,
  },
  itemStock: {
    textAlign: "right",
    backgroundColor: "green",
  },
});

export default HomeScreen;

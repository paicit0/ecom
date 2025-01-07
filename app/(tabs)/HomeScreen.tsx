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
import { useCart, useProductStore } from "../store";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import EmptySearchBar from "../../components/EmptySearchBar";

export const HomeScreen = memo(function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const cart = useCart((state) => state.cartItems);

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

  const render = ({ item }: { item: Product }) => {
    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.id },
        }}
      >
        <View style={styles.itemContainer}>
          <Image
            style={styles.imageItem}
            source={{ uri: item.images[0] }}
            contentFit="cover"
            transition={200}
          />
          <Text style={styles.textItemName}>{item.title}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
          <Text style={styles.itemStock}>Stock: {item.stock}</Text>
        </View>
      </Link>
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
        <View style={{ height: 100 }}></View>
        <EmptySearchBar />
      </View>
      {/* <FlashList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.horizontalListContainer}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={160}
        horizontal={true}
      /> */}
      <FlashList
        data={products}
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
});

const testColor = "green";

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
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
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  badge: {
    position: "absolute",
    top: -12,
    right: -6,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    width: 18,
    height: 18,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;

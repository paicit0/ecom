//HomeScreen.tsx
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
import { Image } from "expo-image";
import SearchBar from "@/components/SearchBar";
import { Product } from "../type/types";
import { Link } from "expo-router";
import { useProductStore } from "../store";

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

        console.log("Filtered Products: " + JSON.stringify(filteredProducts));
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

      nameDisplay = (
        <Text style={styles.textItemName}>
          {before}
          <Text style={[styles.textItemName, { fontWeight: "bold" }]}>
            {match}
          </Text>
          {after}
        </Text>
      );
    } else {
      nameDisplay = <Text style={styles.textItemName}>{item.title}</Text>;
    }

    return (
      <View style={styles.itemContainer}>
        <Link
          href={{
            pathname: "/ItemScreen/[id]" as "/ItemScreen[id]",
            params: { id: item.id },
          }}
        >
          <View style={styles.cardContent}>
            <Image
              style={styles.imageItem}
              source={{ uri: item.images[0] }}
              transition={200}
            />
            {nameDisplay}
            <Text>${item.price}</Text>
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
        <View style={styles.title}>
          <Text></Text>
          <Link href="/LoginScreen" style={styles.title}>
            <Text >Login</Text>
          </Link>
          <Link href="/RegisterScreen" style={styles.title}>
            <Text>Register</Text>
          </Link>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search Items..."
        />
      </View>
      {/* <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        horizontal
        showsHorizontalScrollIndicator={false}
      /> */}

      <FlatList
        data={filteredProducts}
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
    fontSize: 18,
    // fontWeight: "bold",
    // marginBottom: 12,
    color: "#333",
    alignItems: "flex-end",
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
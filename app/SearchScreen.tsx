import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import SearchBar from "../components/SearchBar";
import { useCart, useProductStore } from "./store";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Product } from "./type/types";
import { Image } from "expo-image";

function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const cart = useCart((state) => state.cartItems);

  useEffect(() => {});
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // const renderItem = ({ item }: { item: Product }) => {
  //   const lowerName = item.title.toLowerCase();
  //   const lowerQuery = searchQuery.toLowerCase();
  //   const index = lowerName.indexOf(lowerQuery);
  //   let nameDisplay;

  //   if (index >= 0 && searchQuery) {
  //     const before = item.title.slice(0, index);
  //     const match = item.title.slice(index, index + searchQuery.length);
  //     const after = item.title.slice(index + searchQuery.length);

  //     nameDisplay = // when searched
  //       (
  //         <View style={styles.textItemName}>
  //           <Text numberOfLines={2} ellipsizeMode="tail">
  //             {before}
  //             <Text>{match}</Text>
  //             {after}
  //           </Text>
  //         </View>
  //       );
  //   } else {
  //     // default
  //     nameDisplay = (
  //       <View style={styles.textItemName}>
  //         <Text numberOfLines={2} ellipsizeMode="tail">
  //           {item.title}
  //         </Text>
  //       </View>
  //     );
  //   }

  //   return (
  //     <View style={styles.itemContainer}>
  //       <Link
  //         href={{
  //           pathname: "/ItemScreen/[id]",
  //           params: { id: item.id },
  //         }}
  //         // style={{ flex: 1 }}
  //       >
  //         <View style={styles.cardContent}>
  //           <Image
  //             style={styles.imageItem}
  //             source={{ uri: item.images[0] }}
  //             contentFit="cover"
  //             transition={200}
  //           />
  //           <View>{nameDisplay}</View>
  //           <View
  //             style={{
  //               flexDirection: "row",
  //               alignItems: "center",
  //               justifyContent: "space-between",
  //             }}
  //           >
  //             <Text style={styles.itemPrice}>${item.price}</Text>
  //             <Text style={styles.itemStock}>Stock: {item.stock}</Text>
  //           </View>
  //         </View>
  //       </Link>
  //     </View>
  //   );
  // };

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
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search Items..."
      />
      <TextInput></TextInput>
      <FlashList
        data={useProductStore.getState().products}
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

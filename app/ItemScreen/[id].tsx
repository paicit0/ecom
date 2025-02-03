import { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart, useFavorite } from "../store/store";
import { Link, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useUserSession } from "../auth/firebaseAuth";
import axios from "axios";
import { Product } from "../store/store";
import { FlashList } from "@shopify/flash-list";

const ItemScreen = memo(function ItemScreen() {
  const [product, setProduct] = useState<Product>();
  const { id }: { id: string } = useLocalSearchParams();

  const addToCart = useCart((state) => state.addToCart);

  const addFavorite = useFavorite((state) => state.addToFavorite);
  const deleteFavorite = useFavorite((state) => state.deleteFromFavorite);
  const itemIsFavorited = useFavorite((state) => state.isFavorited);

  useEffect(() => {
    const getTheProduct = async () => {
      try {
        const getTheProductUrl =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_getTheProduct_emulator
            : process.env.EXPO_PUBLIC_getTheProduct_prod;
        if (!getTheProductUrl) {
          console.log("ItemScreen/[id]: url not bussing!");
          return;
        }
        console.log("ItemScreen/[id]: getTheProductUrl:", getTheProductUrl);
        const getTheProduct = await axios.post(
          getTheProductUrl,
          { productId: id },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const getTheProductData = await getTheProduct.data;
        console.log("getTheProduct", getTheProductData);

        if (getTheProductData) {
          setProduct(getTheProductData);
          console.log("getTheProduct: Product State:", product);
        }
      } catch (error) {
        console.log("ItemScreen/[id].getTheProduct:", error);
      }
    };

    getTheProduct();
  }, []);

  // useEffect(() => {
  //   const updateCart = async () => {
  //     try {
  //       const updateUserUrl =
  //         process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
  //           ? process.env.EXPO_PUBLIC_updateUser_emulator
  //           : process.env.EXPO_PUBLIC_updateUser_prod;
  //       if (!updateUserUrl) {
  //         console.log("ItemScreen/[id]: url not bussing!");
  //         return;
  //       }
  //       console.log("ItemScreen/[id]: updateUserUrl:", updateUserUrl);
  //       const update = await axios.post(
  //         updateUserUrl,
  //         { email: userEmail, cart: cartItems },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       console.log(update.status);
  //     } catch (error) {
  //       console.log("ItemScreen/[id].updateCart: update failed: ", error);
  //     }
  //   };
  //   updateCart();
  // }, [cartItems]);

  // useEffect(() => {
  //   console.log("Going to Screen itemId :", id);
  // }, []);

  const render = ({ item }: { item: Product }) => {
    return (
      <View>
        <Image
          // style={styles.imageItem}
          source={{ uri: item.productThumbnailUrl[0] }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  };

  if (!product) {
    return (
      <View>
        <Text>No Product Found... Please contact the admin.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Link href="../(tabs)/HomeScreen">
          <Ionicons name="arrow-back-outline" size={20}></Ionicons>
        </Link>
        <FlashList
          data={[product]}
          renderItem={render}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          // contentContainerStyle={}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={250}
          horizontal={true}
          ListEmptyComponent={() => (
            <Text style={{ color: "red" }}>No Images to Display</Text>
          )}
        />
        <View style={styles.mainDescription}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.productPrice}>
              <Text style={styles.productPriceText}>
                {"$" + product.productPrice}
              </Text>
            </View>
            <View style={styles.productStock}>
              <Text>Stock: {product.productStock}</Text>
            </View>

            {itemIsFavorited(id) ? (
              <Pressable
                onPress={() => {
                  deleteFavorite(id);
                }}
              >
                <View style={styles.favoriteButton}>
                  <Ionicons name="heart" size={24} color="black" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  addFavorite(id);
                }}
              >
                <View style={styles.favoriteButton}>
                  <Ionicons name="heart-outline" size={24} color="black" />
                </View>
              </Pressable>
            )}
          </View>

          <View style={styles.productName}>
            <Text style={styles.productNameText}>{product.productName}</Text>
          </View>
          <View style={styles.productDescription}>
            <Text style={styles.productDescriptionText}>
              {product.productDescription}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ItemFooter}>
        <Pressable
          onPress={() => {
            addToCart(id);
          }}
          style={styles.FooterCart}
        >
          <Ionicons
            name="cart-outline"
            size={20}
            color="white"
            style={{ alignSelf: "center" }}
          />
          <Text style={{ color: "white" }}>Add to Cart</Text>
        </Pressable>
        <Pressable style={styles.FooterBuy}>
          <Text style={{ color: "white", alignSelf: "center" }}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerImage: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  mainDescription: {
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  productName: {
    marginTop: 12,
  },
  productNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  productDescription: {},
  productDescriptionText: {},
  productPrice: {
    marginTop: 12,
  },
  productPriceText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
  },
  productStock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  idContainer: {
    marginTop: 8,
  },
  idText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  ItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "black",
  },
  FooterCart: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 8,
  },
  FooterBuy: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
});

export default ItemScreen;

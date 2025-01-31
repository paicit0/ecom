import { memo, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCart, useFavorite, useProductStore } from "../store/store";
import { Link, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useUserSession } from "../auth/firebaseAuth";
import axios from "axios";

const ItemScreen = memo(function ItemScreen() {
  const { id }: { id: string } = useLocalSearchParams();

  const addToCart = useCart((state) => state.addToCart);
  const cartItems = useCart((state) => state.cartItems);

  const favoriteItems = useFavorite((state) => state.favoriteItems);
  const addFavorite = useFavorite((state) => state.addToFavorite);
  const deleteFavorite = useFavorite((state) => state.deleteFromFavorite);
  const itemIsFavorited = useFavorite((state) => state.isFavorited);

  const userEmail = useUserSession((state) => state.userInfo.email);

  const products = useProductStore((state) => state.products);
  const product = products.find((item) => item.id.toString() === id);

  if (!product) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Product not found!</Text>
      </SafeAreaView>
    );
  }
  useEffect(() => {
    const updateCart = async () => {
      try {
        const updateUser =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_updateUser_emulator
            : process.env.EXPO_PUBLIC_updateUser_prod;
        if (!updateUser) {
          console.log("url not bussing!");
          return;
        }
        const update = await axios.post(
          updateUser,
          { email: userEmail, cart: cartItems },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
    updateCart();
  }, [cartItems]);

  useEffect(() => {
    console.log("itemIsFavorited:", itemIsFavorited(id));
  });
  useEffect(() => {
    console.log("Going to Screen itemId :", id);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Link href="../(tabs)/HomeScreen">
          <Ionicons name="arrow-back-outline" size={20}></Ionicons>
        </Link>
        <View style={styles.headerImage}>
          <Image
            style={styles.image}
            source={{ uri: product.productImageUrl }}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.mainDescription}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.name}>{"$" + product.productPrice}</Text>
            <Text>Stock: {product.productStock}</Text>
            {itemIsFavorited(id) ? (
              <Pressable
                onPress={() => {
                  deleteFavorite(product.id);
                }}
              >
                <Ionicons
                  name="heart"
                  size={25}
                  color="black"
                  style={{ alignSelf: "center" }}
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  addFavorite(product.id);
                }}
              >
                <Ionicons
                  name="heart-outline"
                  size={25}
                  color="black"
                  style={{ alignSelf: "center" }}
                />
              </Pressable>
            )}
          </View>
          <Text style={styles.name}>{product.productName}</Text>
          <Text>{product.productDescription}</Text>
        </View>
      </ScrollView>

      <View style={[styles.ItemFooter, {}]}>
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
    </SafeAreaView>
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
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  idContainer: {
    marginTop: 8,
  },
  idText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    width: 150,
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  statBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statBar: {
    height: 8,
    backgroundColor: "#6890F0",
    borderRadius: 4,
  },
  statValue: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  typesContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  typesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  abilitiesContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 24,
  },
  abilityText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textTransform: "capitalize",
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

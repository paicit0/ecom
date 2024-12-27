import React, { memo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "./type/types";
import { useCart } from "./store";

const ItemScreen = memo(function ItemScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ItemScreen">>();
  const { item } = route.params;
  const addItem = useCart((state) => state.addItem);
  const deleteItem = useCart((state) => state.deleteItem);
  const cart = useCart((state) => state.cartItems);

  console.log("ItemScreen: " + item.title);
  console.log("Current Cart: " + JSON.stringify(cart.map(({ title }) => ({ title }))));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image style={styles.image} source={{ uri: item.images[0] }} />
          <Text style={styles.name}>{item.title.toUpperCase()}</Text>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>
              #{item.id.toString().padStart(3, "0")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.ItemFooter, {}]}>
        <Pressable
          onPress={() => {
            console.log("Adding to cart: " + item.title);
            addItem({
              title: item.title,
              id: item.id,
              images: item.images,
              price: item.price,
            });
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
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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

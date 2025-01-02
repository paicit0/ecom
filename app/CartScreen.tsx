// CartScreen.tsx
import React, { useState, memo } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "./type/types";

export const CartScreen = memo(() => {
  const cart = useCart((state) => state.cartItems);
  const deleteItem = useCart((state) => state.deleteItem);
  const deleteAll = useCart((state) => state.deleteAll);

  const handleCartSubmit = (cart: CartItem[]) => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

  return (
    <ScrollView>
      <View>
        <Text style={{ textAlign: "center" }}>Your Cart</Text>
        {cart.map((item, index) => (
          <View style={styles.cartContainer} key={index}>
            <Text>{item.title}</Text>
            <Text>${item.price}</Text>
            <Image style={styles.imageItem} source={{ uri: item.images[0] }} />
            <Pressable onPress={() => deleteItem(index)}>
              <Ionicons
                name="close-sharp"
                size={20}
                color="#666"
                style={styles.icon}
              />
            </Pressable>
          </View>
        ))}

        {cart.length === 0 && (
          <Text style={{ textAlign: "center" }}>Your cart is empty!</Text>
        )}

        {cart.length > 0 && (
          <View>
            <Pressable onPress={deleteAll}>
              <Text>Delete All</Text>
            </Pressable>
            <Pressable onPress={() => handleCartSubmit(cart)}>
              <Text>Checkout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
  },
  imageItem: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  icon: {
    marginRight: 8,
  },
});

export default CartScreen;

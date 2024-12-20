import React, { useState, memo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { RootStackParamList } from "./type/types";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Text, Image } from "react-native";
import { useCart } from "./store";
import { addData } from "./firestore/cartFireStore";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "./type/types";

const CartScreen = memo(() => {
  const route = useRoute<RouteProp<RootStackParamList, "CartScreen">>();
  const cart = useCart((state) => state.cartItems);
  const deleteItem = useCart((state) => state.deleteItem);
  const deleteAll = useCart((state) => state.deleteAll);

  const handleCartSubmit = (cart: CartItem) => {
    addData(cart);
  }

  return (
    <>
      <View>
        <Text style={{textAlign: 'center'}}>Your Cart</Text>
        {cart.length > 0 && <Pressable onPress={deleteAll}><Text>Delete All</Text></Pressable>}
        {cart.map((item, index) => (
          <View key={index}>
            <Text>{item.name}</Text>
            <Image style={styles.imageItem} source={{ uri: item.sprite }} />
            <Pressable onPress={() => deleteItem(index)}>
              <Ionicons
                name="close-sharp"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <Text>Remove</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => handleCartSubmit(cart[0])}><Text>Checkout</Text></Pressable>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
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

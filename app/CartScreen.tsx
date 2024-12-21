import React, { useState, memo } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { RootStackParamList } from "./type/types";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Text, Image } from "react-native";
import { useCart } from "./store";
import { addData } from "./firestore/cartFireStore";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "./type/types";

export const CartScreen = memo(() => {
  const route = useRoute<RouteProp<RootStackParamList, "CartScreen">>();
  const cart = useCart((state) => state.cartItems);
  const deleteItem = useCart((state) => state.deleteItem);
  const deleteAll = useCart((state) => state.deleteAll);
  
  const handleCartSubmit = (cart: CartItem[]) => {
    cart.forEach(item => {
      addData(item);
    });
    deleteAll();
  }

  return (
    <ScrollView>
      <View>
        <Text style={{textAlign: 'center'}}>Your Cart</Text>
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
            </Pressable>
          </View>
        ))}
        {cart.length > 0 && <Pressable onPress={() => handleCartSubmit(cart)}><Text>Checkout</Text></Pressable>}
        {cart.length === 0 && <Text style={{textAlign: 'center'}}>Your cart is empty!</Text>}
        {cart.length > 0 && <Pressable onPress={deleteAll}><Text>Delete All</Text></Pressable>}
      </View>
    </ScrollView>
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

// CartScreen.tsx
import { memo, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useUserSession } from "./auth/firebaseAuth";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const CartScreen = memo(() => {
  const cartItems = useCart((state) => state.cartItems);
  const deleteFromCart = useCart((state) => state.deleteFromCart);
  const deleteAllCart = useCart((state) => state.deleteAllCart);
  const userEmail = useUserSession((state) => state.userInfo.email);

  useEffect(() => {
    const updateCart = async () => {
      try {
        const idToken = await SecureStore.getItemAsync("authToken");
        const updateUser =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_updateUser_emulator
            : process.env.EXPO_PUBLIC_updateUser_prod;
        if (!updateUser) {
          console.log("cart not bussin urls");
          return;
        }
        const update = await axios.post(
          updateUser,
          {
            email: userEmail,
            favorite: cartItems,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("updateCart", update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
    updateCart();
  }, [cartItems]);

  const handleCartSubmit = () => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

  // const calculateTotal = () => {
  //   let total = 0;
  //   for (let i = 0; i < cart.length; i++) {
  //     total = total + cart[i].productPrice;
  //   }
  //   return total;
  // };

  return (
    <ScrollView>
      <View>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Cart</Text>
        </View>

        {cartItems.map((item, index) => (
          <View style={styles.cartContainer} key={index}>
            <Text>id {item.id}</Text>
            <Text>quantity {item.quantity}</Text>
            {/* <Text>${item.productPrice}</Text>
            <Image
              style={styles.imageItem}
              source={{ uri: item.productThumbnailUrl }}
            /> */}
            <Pressable onPress={() => deleteFromCart(item.id)}>
              <Ionicons
                name="close-sharp"
                size={20}
                color="#666"
                style={styles.icon}
              />
            </Pressable>
          </View>
        ))}

        {cartItems.length === 0 && (
          <Text style={{ textAlign: "center" }}>Your cart is empty!</Text>
        )}

        {cartItems.length > 0 && (
          <View>
            <Pressable onPress={deleteAllCart}>
              <Text>Delete All</Text>
            </Pressable>
            <Pressable onPress={() => handleCartSubmit()}>
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

// CartScreen.tsx
import { memo, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useUserSession } from "./auth/firebaseAuth";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { getAuth } from "firebase/auth";

export const CartScreen = memo(() => {
  const cartItemsArray = useCart((state) => state.cartItemsArray);
  const deleteFromCart = useCart((state) => state.deleteFromCart);
  const deleteAllCart = useCart((state) => state.deleteAllCart);
  const router = useRouter();
  const auth = getAuth();
  const userAuth = auth.currentUser;

  if (!userAuth) {
    console.log("CartScreen: no userAuth, redirecting to /LoginScreen");
    router.replace("/LoginScreen");
    return;
  }
  const updateCart = async () => {
    if (!userAuth.email || !cartItemsArray.length) {
      return;
    }
    try {
      const idToken = await SecureStore.getItemAsync("authToken");
      const updateCartUrl =
        process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
          ? process.env.EXPO_PUBLIC_updateCart_emulator
          : process.env.EXPO_PUBLIC_updateCart_prod;
      if (!updateCartUrl) {
        console.error("CartScreen: cart not bussin urls");
        return;
      }
      console.log(
        "CartScreen: Payload to updateCart:",
        userAuth.email,
        cartItemsArray
      );
      const updateCart = await axios.post(
        updateCartUrl,
        {
          email: userAuth.email,
          cartItemsArray: cartItemsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("CartScreen: updateCart.status", updateCart.status);
    } catch (error) {
      console.error("CartScreen: update failed: ", error);
    }
  };

  useEffect(() => {
    updateCart();
  }, [cartItemsArray]);

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

        {cartItemsArray.map((item, index) => (
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

        {cartItemsArray.length === 0 && (
          <Text style={{ textAlign: "center" }}>Your cart is empty!</Text>
        )}

        {cartItemsArray.length > 0 && (
          <View>
            <Pressable onPress={deleteAllCart}>
              <Text>Delete All</Text>
            </Pressable>
          </View>
        )}
        <Pressable onPress={() => handleCartSubmit()}>
          <Text>Checkout</Text>
        </Pressable>
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

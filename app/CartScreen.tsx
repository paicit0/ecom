// CartScreen.tsx
import { memo, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "./store/store";
import { Link } from "expo-router";
import { useUserSession } from "./auth/firebaseAuth";
import * as SecureStore from "expo-secure-store";

export const CartScreen = memo(() => {
  const cart = useCart((state) => state.cartItems);
  const deleteItem = useCart((state) => state.deleteCart);
  const deleteAll = useCart((state) => state.deleteAllCart);
  const userEmail = useUserSession((state) => state.userInfo.email);

  useEffect(() => {
    const updateCart = async () => {
      try {
        const idToken = await SecureStore.getItemAsync("authToken");
        const updateUser_emu = process.env.EXPO_PUBLIC_updateUser_emulator;
        const updateUser_prod = process.env.EXPO_PUBLIC_updateUser_prod;
        if (!updateUser_emu || !updateUser_prod) {
          console.log("cart not bussin urls");
          return;
        }
        const update = await fetch(updateUser_emu, {
          headers: {
            authentication: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            email: userEmail,
            favorite: cart,
          }),
        });
        console.log(update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
    setTimeout(() => {
      updateCart();
    }, 500);
  }, [cart]);

  const handleCartSubmit = (cart: CartItem[]) => {
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
            <Ionicons name="arrow-back-outline"></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Cart</Text>
        </View>

        {cart.map((item, index) => (
          <View style={styles.cartContainer} key={index}>
            <Text>{item.id}</Text>
            {/* <Text>${item.productPrice}</Text>
            <Image
              style={styles.imageItem}
              source={{ uri: item.productThumbnailUrl }}
            /> */}
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

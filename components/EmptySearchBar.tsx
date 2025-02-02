//EmptySearchScreen.tsx
import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Link } from "expo-router";
import { useCart } from "@/app/store/store";

const EmptySearchBar = memo(function SearchBar() {
  const cart = useCart((state) => state.cartItems);
  return (
    <View style={styles.mainContainer}>
      <View style={styles.searchBarContainer}>
        <Link href="/SearchScreen" asChild>
          <Pressable
            onPress={() => {
              console.log("EmptySearchBar Tapped.");
            }}
            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
          >
            <TextInput
              placeholder="Search Items..."
              editable={false}
              pointerEvents="none"
              style={styles.input}
            />
            {/* <Ionicons name="search" size={30} color="#666" /> */}
          </Pressable>
        </Link>
      </View>
      <View style={styles.cartContainer}>
        <Link href="/CartScreen" asChild>
          <Pressable style={{ marginLeft: 10 }}>
            {cart.length > 0 && (
              <Text style={styles.badge}>
                {cart.length > 99 ? "99+" : cart.length}
              </Text>
            )}
            <Ionicons name="cart-outline" size={25} color="#666" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    padding: 10,
    // flex: 1,
    flexDirection: "row",
  },
  searchBarContainer: {
    flex:6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "black",
    height: 45,
    borderWidth: 0.5,
  },
  cartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    fontSize: 16,
    color: "black",
    fontWeight: "200",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
});
export default EmptySearchBar;

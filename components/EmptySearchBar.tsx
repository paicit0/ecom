//EmptySearchScreen.tsx
import { StyleSheet, View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Link } from "expo-router";
import { useCart } from "@/app/store/store";

const EmptySearchBar = memo(function SearchBar() {
  const cart = useCart((state) => state.cartItems);
  return (
    <View style={styles.mainContainer}>
      <View style={{ height: 53 }}></View>
      <View style={styles.searchBarContainer}>
        <Link href={"/SearchScreen"} style={{  }}>
          <Ionicons name="search" size={25} color="#666" />
          <View style={styles.input}>
            <TextInput
              placeholder="Search Items..."
              editable={false}
            ></TextInput>
          </View>
          <Link href="/CartScreen" style={{}}>
            {cart.length > 0 && (
              <Text style={styles.badge}>
                {cart.length > 99 ? "99+" : cart.length}
              </Text>
            )}
            <Ionicons name="cart-outline" size={25} color="#666" />
          </Link>
        </Link>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: { padding: 10 },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "black",
    height: 53,
    borderWidth: 0.5,
    width: "100%",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "black",
    // width: "100%",
    backgroundColor: "white",
  },
  badge: {
    // position: "absolute",
    // top: -12,
    // right: -6,
    // backgroundColor: "red",
    // color: "white",
    // borderRadius: 10,
    // width: 18,
    // height: 18,
    // textAlign: "center",
    // fontSize: 12,
    // fontWeight: "bold",
    // justifyContent: "center",
    // alignItems: "center",
  },
});

export default EmptySearchBar;

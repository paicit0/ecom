//EmptySearchScreen.tsx
import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import { Link } from "expo-router";
import { useCart } from "@/app/store/store";
import { FadeIn, FadeOut } from "react-native-reanimated";

type SearchBarProps = {
  placeholderArray: string[];
  intervalMs: number;
};

const EmptySearchBar = memo(function SearchBar({
  placeholderArray,
  intervalMs,
}: SearchBarProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() =>
    getRandomPlaceholder(-1)
  );
  const cart = useCart((state) => state.cartItemsArray);

  function getRandomPlaceholder(excludeIndex: number) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * placeholderArray.length);
    } while (randomIndex === excludeIndex);
    return { text: placeholderArray[randomIndex], index: randomIndex };
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPlaceholder((prev: { index: number }) =>
        getRandomPlaceholder(prev.index)
      );
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, []);

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
              placeholder={currentPlaceholder.text}
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
            <Ionicons name="cart-outline" size={28} color="white" />
          </Pressable>
        </Link>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    padding: 10,
    flexDirection: "row",
    backgroundColor: "orange",
  },
  searchBarContainer: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderColor: "black",
    height: 45,
    borderWidth: 0.5,
  },
  cartContainer: {
    flexDirection: "row",
    gap: 18,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    color: "orange",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 1,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
});
export default EmptySearchBar;

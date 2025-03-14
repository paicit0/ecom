// EmptySearchScreen.tsx
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import { Link } from "expo-router";
import { useCart } from "@/app/store/store";
import Animated from "react-native-reanimated";
type SearchBarProps = {
  placeholderArray: string[];
  intervalMs?: number;
  style?: ViewStyle;
  borderColor?: string;
  borderWidth?: number;
};

const EmptySearchBar = memo(function SearchBar({
  placeholderArray,
  intervalMs = 5000,
  style,
  borderColor = "black",
  borderWidth = 0.5,
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
    <Animated.View
      style={[
        styles.searchBarContainer,
        style,
        { borderColor: borderColor, borderWidth: borderWidth },
      ]}
    >
      <Link href="/SearchScreen" asChild>
        <Pressable
          onPress={() => {
            console.log("EmptySearchBar Tapped.");
          }}
          style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name="search-outline"
            size={24}
            style={{ marginRight: 4 }}
          ></Ionicons>
          <TextInput
            placeholder={currentPlaceholder.text}
            placeholderTextColor="grey"
            editable={false}
            pointerEvents="none"
            style={styles.searchBarTextInput}
          />
        </Pressable>
      </Link>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  searchBarContainer: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingLeft: 12,
    borderColor: "black",
    height: 40,
    width: "100%",
    alignSelf: "center",
    opacity: 1,
    borderWidth: 0.5,
  },
  searchBarTextInput: {
    fontSize: 14,
    fontWeight: "200",
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

// EmptySearchScreen.tsx
import { StyleSheet, TextInput, Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import { Link } from "expo-router";
import Animated from "react-native-reanimated";

/**
 * A SearchBar component that displays a randomly rotating placeholder text.
 * Used for an empty search screen.
 *
 * @param {{ placeholderArray: string[]; intervalMs?: number; style?: ViewStyle; borderColor?: string; borderWidth?: number; backgroundColor?: string; placeholderTextColor?: string; }} props
 * @prop {string[]} placeholderArray the array of placeholder text strings to rotate through
 * @prop {number} [intervalMs=5000] the interval in ms between placeholder text changes
 * @prop {ViewStyle} [style] the style for the outer View of the component
 * @prop {string} [borderColor="black"] the color of the border of the component
 * @prop {number} [borderWidth=0.5] the width of the border of the component
 * @prop {string} [backgroundColor="white"] the background color of the component
 * @prop {string} [placeholderTextColor="grey"] the color of the placeholder text
 */

type SearchBarProps = {
  placeholderArray: string[];
  intervalMs?: number;
  style?: ViewStyle;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  placeholderTextColor?: string;
};

const EmptySearchBar = memo(function SearchBar({
  placeholderArray,
  intervalMs = 5000,
  style,
  borderColor = "black",
  borderWidth = 0.5,
  backgroundColor = "white",
  placeholderTextColor = "grey",
}: SearchBarProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() =>
    getRandomPlaceholder(-1)
  );

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
        {
          borderColor: borderColor,
          borderWidth: borderWidth,
          backgroundColor: backgroundColor,
        },
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
            size={18}
            style={{ marginRight: 4 }}
          />
          <TextInput
            placeholder={currentPlaceholder.text}
            placeholderTextColor={placeholderTextColor}
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
    fontSize: 15,
    fontWeight: "300",
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

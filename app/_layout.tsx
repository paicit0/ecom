import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

function RootLayout() {
  return (
    <>
      <View style={layoutStyles.topNavBar}></View>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

const layoutStyles = StyleSheet.create({
  topNavBar: {
    height: 50,
    backgroundColor: "green",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 10,
  },
});

export default RootLayout;

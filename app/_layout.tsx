import { Stack } from "expo-router";

function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}


export default RootLayout
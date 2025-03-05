// app/_layout.tsx
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [publishableKey, setPublishableKey] = useState("");

  const fetchPublishableKey = async () => {
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.log("app/_layout: No EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return;
    }
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider
        publishableKey={publishableKey}
        urlScheme="your-url-scheme"
      >
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="ItemScreen/[id]"
              options={{
                gestureEnabled: true,
                gestureDirection: "horizontal",
                animation: "slide_from_right",
              }}
            />
          </Stack>
        </View>
      </StripeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 10,
  },
});

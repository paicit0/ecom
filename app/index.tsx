//eas build --profile development --platform android
//Index.tsx
import { Redirect } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Index() {
  const [publishableKey, setPublishableKey] = useState("");

  const fetchPublishableKey = async () => {
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.log("No EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return;
    }
    setPublishableKey(key);
    console.log("Index: StripePublishableKey", publishableKey);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  console.log(
    "Index: Launching app in mode:",
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE
  );

  if (process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "prod") {
    console.log = function no_console() {};
    console.error = function no_console() {};
    console.warn = function no_console() {};
    console.debug = function no_console() {};
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider
        publishableKey={publishableKey}
        urlScheme="your-url-scheme"
      >
        <Redirect href="../(tabs)/HomeScreen" />
      </StripeProvider>
    </QueryClientProvider>
  );
}

export default Index;

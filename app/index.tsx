//eas build --profile development --platform android
//Index.tsx
import { Redirect } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useState, useEffect } from "react";

function Index() {
  const [publishableKey, setPublishableKey] = useState("");

  const fetchPublishableKey = async () => {
    const key = process.env.EXPO_PUBLIC_PUBLISHABLEKEY || "";
    setPublishableKey(key);
    console.log(publishableKey);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="your-url-scheme">
      <Redirect href="../(tabs)/HomeScreen" />
    </StripeProvider>
  );
}

export default Index;

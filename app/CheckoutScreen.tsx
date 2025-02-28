// CheckoutScreen.tsx
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import axios from "axios";

function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { amount } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const fetchPaymentSheetParams = async () => {
    const stripePaymentSheetUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_stripePaymentSheet_emulator
        : process.env.EXPO_PUBLIC_stripePaymentSheet_prod;
    console.log("CheckoutScreen: amount cash in สตางค์:", amount);
    if (!stripePaymentSheetUrl) {
      console.error("CheckoutScreen: urls not good");
    }

    const fetchPaymentSheet = await axios.post(
      `${stripePaymentSheetUrl}/payment-sheet`,
      { amount: amount, userEmail: userEmail },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "CheckoutScreen: fetchPaymentSheet.status:",
      fetchPaymentSheet.status
    );
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheet.data;
    console.log("CheckoutScreen: PaymentIntent:", paymentIntent);
    console.log("CheckoutScreen: CustomerId:", customer);

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    setLoading(true);
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
    });
    if (!error) {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    console.log("CheckoutScreen: openPaymentSheet");
    const { error } = await presentPaymentSheet();
    setLoading(true);

    if (error) {
      console.error("CheckOutScreen: Error:", error);
      setLoading(false);
    } else {
      console.log("CheckOutScreen: Success", "Your order is confirmed!");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  const amountInBaht = parseInt(amount as string) / 100;
  return (
    <>
      <Pressable
        style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
        disabled={loading}
        onPress={() => {
          openPaymentSheet();
        }}
      >
        <Text>Price: ฿{amountInBaht}</Text>
        <Text>PRESS HERE TO OPEN PAYMENT SHEET</Text>
      </Pressable>
    </>
  );
}
const styles = StyleSheet.create({});

export default CheckoutScreen;

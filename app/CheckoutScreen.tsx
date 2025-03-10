// CheckoutScreen.tsx
import { Pressable, View, Text, StyleSheet, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { thailandProvinces } from "../assets/db/province";
import { Dropdown } from "react-native-element-dropdown";
import { useUserSession } from "./auth/firebaseAuth";
import * as SecureStore from "expo-secure-store";

function CheckoutScreen() {
  const [loading, setLoading] = useState(false);
  const [customerCity, setCustomerCity] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { amount, name, quantity } = useLocalSearchParams();
  const auth = getAuth();
  const userEmail = auth.currentUser?.email;
  const router = useRouter();
  const userSession = useUserSession();
  const userInfo = userSession.getUserInfo;

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const fetchPaymentSheetParams = async () => {
    const usergetUserUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_usergetUser_emulator
        : process.env.EXPO_PUBLIC_usergetUser_prod;
    const stripePaymentSheetUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_stripePaymentSheet_emulator
        : process.env.EXPO_PUBLIC_stripePaymentSheet_prod;

    console.log("CheckoutScreen: amount cash in สตางค์:", amount);
    if (!stripePaymentSheetUrl || !usergetUserUrl) {
      console.error("CheckoutScreen: urls not good");
      throw new Error("CheckoutScreen: urls not good");
    }
    const idToken = await SecureStore.getItemAsync("authToken");
    let customerId;
    try {
      console.log("CheckoutScreen: fetchUser payload:", userEmail);
      const fetchUser = await axios.get(usergetUserUrl, {
        params: { userEmail: userEmail },
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      const userData = fetchUser.data;
      console.log(userData.message);

      if (userData.customerIdStripe) {
        customerId = userData.customerIdStripe;
      } else {
        customerId = null;
      }
    } catch (error) {
      console.log(error);
    }

    console.log(
      "CheckoutScreen: fetchPaymentSheet payload:",
      amount,
      userEmail,
      province,
      userEmail,
      customerId
    );
    try {
      const fetchPaymentSheet = await axios.post(
        `${stripePaymentSheetUrl}/payment-sheet`,
        {
          amount: parseInt(amount as string) * parseInt(quantity as string),
          userEmail: userEmail,
          customerCity: province,
          customerName: userEmail,
          customerId: customerId,
        },
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
    } catch (error) {
      console.error("CheckoutScreen: fetchPaymentSheet error:", error);
      throw new Error("CheckoutScreen: fetchPaymentSheet error");
    }
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
      router.replace("/FailedPaymentScreen");
      setLoading(false);
    } else {
      console.log("CheckOutScreen: Success", "Your order is confirmed!");
      router.replace("/SucceededPaymentScreen");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  const amountInBaht =
    (parseInt(amount as string) / 100) * parseInt(quantity as string);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
      }}
    >
      <TextInput
        style={{}}
        placeholder="City"
        value={customerCity}
        onChangeText={(text) => setCustomerCity(text)}
      ></TextInput>
      <Dropdown
        style={{}}
        data={thailandProvinces}
        onChange={(item) => {
          setProvince(item.value);
        }}
        placeholder="   Select Province"
        value={province}
        labelField="label"
        valueField="value"
      />
      <Pressable
        // style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
        disabled={loading}
        onPress={() => {
          openPaymentSheet();
        }}
      >
        <Text>
          {quantity}x {name}
        </Text>
        <Text>Price: ฿{amountInBaht.toLocaleString()}</Text>
        <Text>PRESS HERE TO OPEN PAYMENT SHEET</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({});

export default CheckoutScreen;

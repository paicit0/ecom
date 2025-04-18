// CheckoutScreen.tsx
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { thailandProvinces } from "../assets/db/province";
import { Dropdown } from "react-native-element-dropdown";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckoutProducts } from "./CartScreen";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";

function CheckoutScreen() {
  const [checkoutProducts, setCheckoutProducts] = useState<CheckoutProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerCity, setCustomerCity] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const auth = getAuth();
  const userEmail = auth.currentUser?.email;
  const router = useRouter();

  const { products } = useLocalSearchParams();
  const productsObjArray: CheckoutProducts[] = JSON.parse(products as string);

  if (!productsObjArray) {
    console.error("CheckoutScreen: no productsObj found!");
    return;
  }
  const totalInSatang = productsObjArray[productsObjArray.length - 1].total;
  if (!totalInSatang) {
    console.error("CheckoutScreen: no total cost found!");
    return;
  }
  const totalInBaht = totalInSatang / 100;

  useEffect(() => {
    productsObjArray.pop();
    console.log(productsObjArray);
    // setCheckoutProducts(productsObjArrayWithoutTotal)
    console.log(
      "CheckoutScreen: products received from CartScreen:",
      productsObjArray
    );
    console.log("CheckoutScreen: totalInSatang:", totalInSatang);
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

    console.log("CheckoutScreen: total cash in สตางค์:", totalInSatang);
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
      console.log("CheckoutScreen:userData.message:", userData.message);

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
      totalInSatang,
      userEmail,
      province,
      userEmail,
      customerId
    );
    try {
      const fetchPaymentSheet = await axios.post(
        `${stripePaymentSheetUrl}/payment-sheet`,
        {
          amount: totalInSatang,
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
    const idToken = await SecureStore.getItemAsync("authToken");
    console.log("CheckoutScreen: openPaymentSheet");
    const { error } = await presentPaymentSheet();
    setLoading(true);

    if (error) {
      console.error("CheckOutScreen: Error:", error);
      router.replace("/FailedPaymentScreen");
      setLoading(false);
    } else {
      try {
        console.log("CheckoutScreen: adding transaction to user:", userEmail);
        const addTransactionUrl =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_addTransaction_emulator
            : process.env.EXPO_PUBLIC_addTransaction_prod;
        if (!addTransactionUrl) {
          throw new Error("CheckoutScreen: addTransaction url not good.");
        }
        console.log("CheckoutScreen:addTransactionUrl:", addTransactionUrl);
        const fetchTransaction = await axios.post(
          addTransactionUrl,
          {
            buyerEmail: userEmail,
            productsObj: productsObjArray,
            totalPrice: totalInSatang / 100,
            recipientAddress: "khon kaen test",
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const fetchTransactionData = await fetchTransaction.data;
        console.log("CheckoutScreen: transaction added:", fetchTransactionData);
      } catch (error) {
        console.error("CheckoutScreen: addTransaction error", error);
      }
      console.log("CheckOutScreen: Success", "Your order is confirmed!");
      router.replace({
        pathname: "/SucceededPaymentScreen",
        params: {
          total: totalInSatang / 100,
          // quantity: productsArray[0].quantity,
          quantity: 50,
        },
      });
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  const render = ({ item }: { item: CheckoutProducts }) => {
    return (
      <>
        <Image
          style={styles.imageItem}
          source={{ uri: item.productImg }}
          contentFit="cover"
          transition={200}
        />
        <Text>{item.productName}</Text>
        <Text>฿{item.productPrice / 100}</Text>
        <Text>{item.productQuantity}</Text>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.flashListContainer}>
        <FlashList
          data={productsObjArray.slice(0, -1)}
          renderItem={render}
          keyExtractor={(item) => item.productId}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          horizontal={false}
          ListEmptyComponent={() => (
            <>
              <Text>Empty</Text>
            </>
          )}
          extraData={productsObjArray.slice(0, -1)}
          onEndReachedThreshold={0.5}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text>Your Email: {userEmail}</Text>
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
          disabled={loading}
          onPress={() => {
            openPaymentSheet();
          }}
        >
          <Text>Total: ฿{totalInBaht.toLocaleString()}</Text>
          <Text>PRESS HERE TO OPEN PAYMENT SHEET</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: "red" }}>FOOTER</Text>
      </View>
    </SafeAreaView>
  );
}

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  flashListContainer: {
    flex: 1,
  },
  infoContainer: {
    // flex: 1,
    alignSelf: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    backgroundColor: "black",
  },
  imageItem: {
    height: 100,
    width: 100,
    borderRadius: 8,
  },
});

export default CheckoutScreen;

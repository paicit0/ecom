// ProfileScreen.tsx
import { Link, useRouter } from "expo-router";
import { View, Text, Pressable, Dimensions, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../../auth/firebaseAuth";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import AnimatedLoadingIndicator from "../../components/AnimatedLoadingIndicator";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCart } from "../../hooks/fetch/useGetCart";
function ProfileScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const userIsSignedIn = useUserSession((state) => state.userIsSignedIn);
  const logout = useUserSession((state) => state.logout);
  const userInfoFromStore = useUserSession((state) => state.userInfo);
  const { getUserInfo } = useUserSession();
  const router = useRouter();

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  if (!userEmail) {
    console.log("ProfileScreen: no userEmail");
    // return;
  }
  const getCartQuery = useGetCart({ userEmail: auth.currentUser?.email as string });

  // useEffect(() => {
  //   console.log("ProfileScreen: loading:", loading);
  //   console.log("ProfileScreen: userAuth: ", userAuth);
  // }, []);

  const handleSellerRegister = async () => {
    if (!userIsSignedIn) {
      setError("Please sign in first!");
      return;
    }

    const idToken = await SecureStore.getItemAsync("authToken");
    console.log("ProfileScreen: idToken:", idToken);

    const registerSellersUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_registerSellers_emulator
        : process.env.EXPO_PUBLIC_registerSellers_prod;

    if (!registerSellersUrl) {
      console.log("ProfileScreen: url not busssinn");
      return;
    }
    try {
      console.log(
        "ProfileScreen: Trying to registerSellers with: ",
        userInfoFromStore.userEmail
      );
      const registerSeller = await axios.post(
        registerSellersUrl,
        { email: userInfoFromStore.userEmail },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        "ProfileScreen: registerSeller.status",
        registerSeller.status
      );
      if (registerSeller.status === 200) {
        getUserInfo(userInfoFromStore.userEmail);
      }
    } catch (error) {
      console.error("ProfileScreen: ", error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { success, message } = await logout();
      if (success) {
        setLoading(false);
        router.replace("/(tabs)/HomeScreen");
      } else {
        console.error("ProfileScreen: handleLogout Error:", message);
      }
    } catch (error) {
      console.error("ProfileScreen: handleLogout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={loading} />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={styles.topButtonsContainer}>
            <View style={{ justifyContent: "flex-start" }}>
              {userInfoFromStore.userRole !== "seller" && auth.currentUser && (
                <Pressable
                  style={{
                    flexDirection: "row",
                    backgroundColor: "white",
                    borderBottomRightRadius: 20,
                    borderTopRightRadius: 20,
                  }}
                  onPress={handleSellerRegister}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={24}
                    style={{ alignSelf: "center", color: "black" }}
                  />
                  <Text style={{ alignSelf: "center", marginLeft: 5 }}>
                    Become a Seller
                  </Text>
                  <Ionicons
                    style={{ alignSelf: "center" }}
                    name="chevron-forward"
                    size={20}
                  />
                </Pressable>
              )}
            </View>
            <View style={styles.headerContainer}>
              <Ionicons name="settings-outline" size={28} color={"white"} />
              <Link href={"/CartScreen"} asChild>
                <Pressable>
                  <Ionicons name="cart-outline" size={28} color={"white"} />
                  {(getCartQuery.data?.length as number) > 0 && (
                    <Text style={styles.cartBadge}>
                      {(getCartQuery.data?.length as number) > 99
                        ? "99+"
                        : getCartQuery.data?.length}
                    </Text>
                  )}
                </Pressable>
              </Link>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={"white"}
              />
            </View>
          </View>
          <>
            <View style={styles.mainUserProfileContainer}>
              <View style={styles.usersProfileContainer}>
                {auth.currentUser ? (
                  <>
                    <View style={{ flexDirection: "row", paddingLeft: 16 }}>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <Ionicons
                          name="happy"
                          size={50}
                          style={{ color: "white" }}
                        />
                        <View
                          style={{
                            flexDirection: "column",
                            marginLeft: 10,
                            justifyContent: "center",
                          }}
                        >
                          <Text style={styles.userNameText}>Piyapat</Text>
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <Text>50 Followers</Text>
                            <Text>50 Following</Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          alignItems: "flex-end",
                          alignSelf: "center",
                          marginRight: 16,
                        }}
                      >
                        <Pressable
                          onPress={handleLogout}
                          style={{
                            justifyContent: "center",
                            backgroundColor: "white",
                            padding: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: "orange",
                              fontSize: 16,
                              textAlign: "center",
                            }}
                          >
                            Logout
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <Ionicons
                        name="sad"
                        size={50}
                        style={{ color: "white", flex: 1 }}
                      />
                      <View style={styles.loginRegisterContainer}>
                        <Link href="/LoginScreen" asChild>
                          <Pressable
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              backgroundColor: "white",
                            }}
                          >
                            <Text
                              style={{
                                color: "orange",
                                fontSize: 16,
                                textAlign: "center",
                              }}
                            >
                              Login
                            </Text>
                          </Pressable>
                        </Link>
                        <Link href="/RegisterScreen" asChild>
                          <Pressable
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              borderColor: "white",
                              borderWidth: 1,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 16,
                                textAlign: "center",
                                // flex: 1,
                              }}
                            >
                              Register
                            </Text>
                          </Pressable>
                        </Link>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
            <Link href="/PurchaseHistoryScreen" asChild>
              <Pressable style={styles.purchaseHistoryContainer}>
                <Text
                  style={{
                    flex: 1.49,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Your Purchases
                </Text>
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <Text>View Purchase History</Text>
                  <Ionicons name="chevron-forward" size={20} />
                </View>
              </Pressable>
            </Link>
            <View style={styles.purchaseButtonWithTextBelowContainer}>
              <View style={styles.purchaseButtonWithTextBelow}>
                <Ionicons name="wallet-outline" size={32} />
                <Text>To Pay</Text>
              </View>
              <View style={styles.purchaseButtonWithTextBelow}>
                <Ionicons name="file-tray-outline" size={32} />
                <Text>To Deliver</Text>
              </View>
              <View style={styles.purchaseButtonWithTextBelow}>
                <Ionicons name="rocket-outline" size={32} />
                <Text>To Receive</Text>
              </View>
              <View style={styles.purchaseButtonWithTextBelow}>
                <Ionicons name="star-outline" size={32} />
                <Text>Rating</Text>
              </View>
            </View>
            <View>
              <Link href={"/FavoriteScreen"} asChild>
                <Pressable
                  style={{
                    width: deviceWidth,
                    flexDirection: "row",
                    alignContent: "flex-start",
                    alignItems: "center",
                    paddingLeft: 15,
                    paddingTop: 15,
                    paddingBottom: 15,
                    gap: 8,
                    borderColor: "grey",
                    borderTopWidth: 0.5,
                    borderBottomWidth: 0.5,
                    backgroundColor: "white",
                  }}
                >
                  <Ionicons name="heart" size={26} color={"red"} />
                  <Text>Your Favorites</Text>
                </Pressable>
              </Link>

              <Pressable
                style={{
                  width: deviceWidth,
                  flexDirection: "row",
                  alignContent: "flex-start",
                  alignItems: "center",
                  paddingLeft: 15,
                  paddingTop: 15,
                  paddingBottom: 15,
                  gap: 8,
                  borderColor: "grey",
                  borderTopWidth: 0.5,
                  borderBottomWidth: 0.5,
                  backgroundColor: "white",
                }}
              >
                <Ionicons name="fast-food-outline" size={26} />
                <Text>GoFood</Text>
              </Pressable>
              <Pressable
                style={{
                  width: deviceWidth,
                  flexDirection: "row",
                  alignContent: "flex-start",
                  alignItems: "center",
                  paddingLeft: 15,
                  paddingTop: 15,
                  paddingBottom: 15,
                  gap: 8,
                  borderColor: "#DEDFE4",
                  borderTopWidth: 0.5,
                  borderBottomWidth: 7,
                  backgroundColor: "white",
                }}
              >
                <Ionicons name="phone-portrait-outline" size={26} />
                <Text>Go-Service / Go-Voucher</Text>
              </Pressable>
            </View>
          </>
          <Pressable
            onPress={() => {
              console.log(
                "ProfileScreen: userInfoFromStore:",
                userInfoFromStore
              );
              console.log("ProfileScreen: loading:", loading);
              console.log("ProfileScreen: userAuth: ", auth.currentUser?.uid);
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get user status</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(tabs)/test")}>
            <Text>Go Test</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "orange",
  },
  headerContainer: {
    flexDirection: "row",
    gap: 12,
    marginRight: 16,
    paddingTop: 5,
  },

  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "orange",
  },
  mainUserProfileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: deviceWidth,
    backgroundColor: "orange",
    // paddingHorizontal: 24,
    paddingVertical: 10,
  },
  usersProfileContainer: {
    flex: 1,
    justifyContent: "flex-start",
    // paddingLeft: 15,
    // backgroundColor: "blue",
  },
  userNameText: {
    color: "white",
  },

  loginRegisterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "center",
    paddingRight: 15,
    gap: 7,
    flex: 1,
    height: 30,
    // backgroundColor: "red",
  },
  purchaseHistoryContainer: {
    flexDirection: "row",
    width: deviceWidth,
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 20,
    paddingRight: 15,
    paddingLeft: 15,
    backgroundColor: "white",
  },
  purchaseButtonWithTextBelowContainer: {
    width: deviceWidth,
    flexDirection: "row",
    gap: 42,
    justifyContent: "center",
    backgroundColor: "white",
    paddingBottom: 15,
  },
  purchaseButtonWithTextBelow: {
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
  },
  link: {
    fontSize: 16,
    color: "#646ff0",
    textDecorationLine: "underline",
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b81",
    fontSize: 14,
    marginBottom: 10,
  },
  cartBadge: {
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

export default ProfileScreen;

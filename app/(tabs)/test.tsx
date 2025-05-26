import { View, Text } from "react-native";
import { Link } from "expo-router";
import { CheckoutProducts } from "../CartScreen";

function test() {
  const selectedProductsObj: CheckoutProducts[] = [
    {
      productPriceSatang: 1000,
      productName: "mockProductname",
      productQuantity: 999,
      productId: "12345",
      productImg:
        "https://ecom-firecloud.s3.ap-southeast-2.amazonaws.com/thumbnails/46f2fb84-39ff-4b6d-ab3d-c510cf021e99-0",
      productOwner: "mockOwner",
    },
    {
      productPriceSatang: 2000,
      productName: "mockProductname2",
      productQuantity: 888,
      productId: "67890",
      productImg:
        "https://ecom-firecloud.s3.ap-southeast-2.amazonaws.com/thumbnails/46f2fb84-39ff-4b6d-ab3d-c510cf021e99-0",
      productOwner: "mockOwner2",
    },
    {
      productPriceSatang: 3000,
      productName: "mockProductname3",
      productQuantity: 777,
      productId: "11111",
      productImg:
        "https://ecom-firecloud.s3.ap-southeast-2.amazonaws.com/thumbnails/46f2fb84-39ff-4b6d-ab3d-c510cf021e99-0",
      productOwner: "mockOwner3",
    },
    {
      productPriceSatang: 4000,
      productName: "mockProductname4",
      productQuantity: 666,
      productId: "22222",
      productImg:
        "https://ecom-firecloud.s3.ap-southeast-2.amazonaws.com/thumbnails/46f2fb84-39ff-4b6d-ab3d-c510cf021e99-0",
      productOwner: "mockOwner4",
    },
  ];
  const totalCost = 100;

  return (
    <>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Link
          href={{
            pathname: "/CheckoutScreen",
            params: {
              products: JSON.stringify([
                ...selectedProductsObj,
                { total: totalCost },
              ]),
            },
          }}
        >
          <Text>Go To Checkout</Text>
        </Link>
      </View>
    </>
  );
}

export default test;

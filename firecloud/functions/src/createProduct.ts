import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";

const createProduct = functions.https.onRequest(async (req, res) => {
  try {
    const { productName, productPrice, imageUrl } = req.body;
    const product = {
      productName: productName,
      productPrice: productPrice,
      soldNumber: 0,
      Timestamp: Timestamp.now(),
      imageUrl: imageUrl,
    };
    const productsCollection = db.collection("products");
    const createOneProduct = await productsCollection.add(product);
    console.log(
      "Product added successfully! " + "Product ID: " + createOneProduct.id
    );
  } catch (error) {
    res.status(400).json({ message: "failed the create product!" });
    console.log(error);
  }
});

export default { createProduct };

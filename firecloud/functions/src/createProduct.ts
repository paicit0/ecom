import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";

const createProduct = functions.https.onRequest(async (req, res) => {
  try {
    console.log("createProduct req.body: ", req.body);
    const { productName, productPrice, imageUrl, thumbnailUrl, owner } = req.body;
    const product = {
      productName: productName,
      productPrice: productPrice,
      soldNumber: 0,
      imageUrl: imageUrl,
      thumbnailurl: thumbnailUrl,
      owner: owner,
      Timestamp: Timestamp.now(),
    };
    const productsCollection = db.collection("products");
    const createOneProduct = await productsCollection.add(product);
    console.log(
      "Product added successfully! " + "Product ID: " + createOneProduct.id
    );
    res.status(200).json({
      message: "Product submitted sucessfully! " + createOneProduct.id,
    });
  } catch (error) {
    res.status(400).json({ message: "failed the create product!" });
    console.log(error);
  }
});

export { createProduct };

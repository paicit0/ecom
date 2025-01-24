import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";

const createProduct = functions.https.onRequest(async (req, res) => {
  try {
    console.log("createProduct req.body: ", req.body);
    const {
      productName,
      productDescription = "Contact the owner",
      productCategory,
      productPrice,
      productImageUrl,
      productThumbnailUrl,
      productStock = "Contact the owner",
      productOwner,
    } = req.body;

    if (!productName || !productPrice || !productImageUrl || !productThumbnailUrl || !productOwner) {
      res.status(400).json({ message: "incomplete fields!" });
    }

    const product = {
      productName: productName,
      productPrice: productPrice,
      productDescription: productDescription,
      productCategory: productCategory,
      productImageUrl: productImageUrl,
      productThumbnailUrl: productThumbnailUrl,
      productStock: productStock,
      productOwner: productOwner,
      soldNumber: 0,
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

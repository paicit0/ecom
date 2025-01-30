import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { Product } from "../../../app/store/store";

const createProduct = functions.https.onRequest(async (req, res) => {
  try {
    console.log("createProduct req.header: ", req.headers.authorization);
    console.log("createProduct req.body: ", req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        res.status(401).json("No auth token.");
        return;
      }
    } catch (error) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }

    const userEmail = decodedToken.email;
    console.log("req.header bearer: ", idToken);

    if (userEmail !== req.body.productOwner) {
      res.status(403).json({ message: "Forbidden!" });
      return;
    }

    const {
      productName,
      productDescription = "Contact the owner",
      productCategory,
      productPrice,
      productImageUrl,
      productThumbnailUrl,
      productStock = "Contact the owner",
      productOwner,
    }: Product = req.body;

    if (
      !productName ||
      !productPrice ||
      !productImageUrl ||
      !productThumbnailUrl ||
      !productOwner
    ) {
      res.status(400).json({ message: "incomplete fields!" });
      return;
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
    return;
  } catch (error) {
    res.status(400).json({ message: "failed the create product!" });
    console.log(error);
    return;
  }
});

export { createProduct };

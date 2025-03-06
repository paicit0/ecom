// getTheProduct.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";

const app = express();

app.get("/", async (req, res) => {
  try {
    console.log("getTheProduct: req.body: ", req.query);
    const { userEmail, productId } = req.query;

    if (!userEmail || !productId) {
      return res
        .status(400)
        .send({ error: "getTheProduct: userEmail/productId is required" });
    }

    const productRef = db.collection("products").doc(productId as string);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res
        .status(404)
        .json({ error: "getTheProduct: No product found with the given ID" });
    }

    const userRef = db.collection("users").where("userEmail", "==", userEmail);
    const userDoc = await userRef.get();
    const productData = productDoc.data();

    if (
      userDoc.docs.length > 0 &&
      userDoc.docs[0].data().favoriteItemsArray.includes(productId)
    ) {
      console.log("getTheProduct: isFavorite:true");
      return res.status(200).json({ ...productData, isFavorite: true });
    } else {
      console.log("getTheProduct: isFavorite:false");
      return res.status(200).json({ ...productData, isFavorite: false });
    }
  } catch (error) {
    console.error("getTheProduct error: ", error);
    return res.status(500).json({ error: "getTheProduct: Internal server error" });
  }
});

export const getTheProduct = functions.https.onRequest(app);

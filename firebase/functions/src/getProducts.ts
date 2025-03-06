// getProducts.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";

const app = express();

app.get("/", async (req, res) => {
  try {
    console.log("getProducts req.query: ", req.query);
    const numberOfItems = parseInt(req.query.numberOfItems as string, 10);
    const currentProductNumber = parseInt(
      req.query.currentProductNumber as string,
      10
    );
    const productsSnapshot = await db
      .collection("products")
      .orderBy("productName")
      .limit(numberOfItems)
      .offset(currentProductNumber)
      .get();

    const productsData = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("getProducts: productsData.length: ", productsData.length);

    return res.status(200).json({ productsData: productsData });
  } catch (error) {
    console.log("getProducts error: ", error);
    return res.status(400);
  }
});

export const getProducts = functions.https.onRequest(app);

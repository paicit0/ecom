// getProducts.ts
import * as functions from "firebase-functions";
import { db } from "./index";

const getProducts = functions.https.onRequest(async (req, res) => {
  try {
    // fix this up
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

    res.status(200).json({ productsData: productsData });
  } catch (error) {
    console.log("getProducts error: ", error);
    res.status(400);
  }
});

export { getProducts };

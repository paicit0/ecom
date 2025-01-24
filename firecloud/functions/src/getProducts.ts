import * as functions from "firebase-functions";
import { db } from "./index";

const getProducts = functions.https.onRequest(async (req, res) => {
  try {
    // fix this up
    console.log("getProducts req.body: ", req.body);
    const { numberOfItems, currentProductNumber } = req.body;
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

    res.status(200).json({ productsData });
  } catch (error) {
    console.log("getProducts error: ", error);
    res.status(400);
  }
});

export { getProducts };

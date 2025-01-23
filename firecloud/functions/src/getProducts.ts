import * as functions from "firebase-functions";
import { db } from "./index";

const getProducts = functions.https.onRequest(async (req, res) => {
  try {
    // fix this up
    console.log("getProducts req.body: ", req.body);
    const { numberOfItems } = req.body;
    const docRef = await db
      .collection("products")
      .orderBy("productName")
      .startAt()
      .get();
    console.log(numberOfItems);
    const productsCollection = db.collection("products");
    console.log(productsCollection);
    res.status(200);
  } catch (error) {
    console.log("getProducts error: ", error);
    res.status(400);
  }
});

export { getProducts };

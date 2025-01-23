import * as functions from "firebase-functions";
import { db } from "./index";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const buyProduct = functions.https.onRequest(async (req, res) => {
  try {
    const { productId } = req.body;

    const productsCollection = db.collection("products").doc(productId);
    const updateProductStock = await productsCollection.update({
      soldNumber: FieldValue.increment(1),
      updatedTime: Timestamp.now(),
    });
    console.log(updateProductStock);
  } catch (error) {
    res.status(400).json({ message: "failed the create product!" });
    console.log(error);
  }
});

export { buyProduct };

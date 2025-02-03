import * as functions from "firebase-functions";
import { db } from "./index";

const getTheProduct = functions.https.onRequest(async (req, res) => {
  try {
    console.log("getTheProduct: req.body: ", req.body);
    const { productId } = req.body;

    if (!productId) {
      res.status(400).send("getTheProduct: productId is required");
      return;
    }

    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      res
        .status(404)
        .json({ error: "getTheProduct: No product found with the given ID" });
      return;
    }

    const productData = productDoc.data();
    if (productData) {
      productData.Timestamp = productData.Timestamp.toDate().toISOString();
      delete productData.Timestamp;
      res.status(200).json(productData);
    } else {
      res
        .status(500)
        .json({ error: "getTheProduct: Failed to retrieve product data" });
    }
  } catch (error) {
    console.log("getTheProduct error: ", error);
    res.status(500).json({ error: "getTheProduct: Internal server error" });
  }
});

export { getTheProduct };

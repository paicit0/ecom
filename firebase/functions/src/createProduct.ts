import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

const createProduct = functions.https.onRequest(async (req, res) => {
  try {
    console.log("createProduct: req.header: ", req.headers.authorization);
    console.log("createProduct: req.body: ", req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("createProduct: no/invalid auth in headers!");
      res.status(401).json({ error: "createProduct: no auth in headers!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        console.log("createProduct: No auth token.");
        res.status(401).json({ error: "createProduct: No auth token." });
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: `createProduct: Unauthorized! ${error}` });
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
    } = req.body;

    if (
      !productName ||
      !productPrice ||
      !productImageUrl ||
      !productThumbnailUrl ||
      !productOwner
    ) {
      res.status(400).json({ error: "createProduct: incomplete fields!" });
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
      productSoldNumber: 0,
      productTimestamp: Timestamp.now(),
    };
    const createOneProduct = await db.collection("products").add(product);
    console.log(
      "createProduct: Product submitted successfully! Product ID:" +
        createOneProduct.id
    );
    const productsWithId = { ...product, productId: createOneProduct.id };
    await db
      .collection("products")
      .doc(createOneProduct.id)
      .set(productsWithId);

    res.status(201).json({
      message:
        "createProduct: Product submitted sucessfully! " + createOneProduct.id,
    });
    return;
  } catch (error) {
    res
      .status(400)
      .json({ error: "createProduct: failed the create product!" });
    console.log(error);
    return;
  }
});

export { createProduct };

// createProducts.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  try {
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
      return res
        .status(400)
        .json({ error: "createProduct: incomplete fields!" });
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

    return res.status(201).json({
      message:
        "createProduct: Product submitted sucessfully! " + createOneProduct.id,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "createProduct: failed the create product!" });
  }
});

export const createProduct = functions.https.onRequest(app);

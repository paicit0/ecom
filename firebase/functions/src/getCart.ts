// getCart.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import { FieldPath } from "firebase-admin/firestore";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log("getCart: req.query: ", userEmail);

    if (!userEmail) {
      console.log("getCart: no/invalid userEmail in query!");
      return res
        .status(401)
        .json({ error: "getCart: no/invalid userEmail in query!" });
    }

    const usersQuerySnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .limit(1)
      .get();
    console.log("getCart: usersQuerySnapshot.size", usersQuerySnapshot.size);

    if (usersQuerySnapshot.empty) {
      console.error("getCart: User not found", userEmail);
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = usersQuerySnapshot.docs[0];
    console.log("getCart: userDoc", userDoc);
    if (!userDoc.exists) {
      console.error("getCart: User's data not found", userEmail);
      return res.status(404).json({ error: "getCart: User's data not found" });
    }

    const cartItemsArray = userDoc.data().cartItemsArray;
    console.log("getCart: cartItemsArray:", cartItemsArray);
    console.log("getCart: cartItemsArray.length:", cartItemsArray.length);

    if (cartItemsArray.length === 0) {
      console.log("getCart: No cart items found", { email: userEmail });
      return res.status(200).json({ cartProducts: [] });
    }

    const productIds = cartItemsArray.map(
      (item: { productId: string; productQuantity: number }) => item.productId
    );

    const productsSnapshot = await db
      .collection("products")
      .where(FieldPath.documentId(), "in", productIds)
      .get();
    console.log("getCart: productsSnapshot:", productsSnapshot);

    const cartProducts = productsSnapshot.docs.map((doc) => {
      const cartItem = cartItemsArray.find(
        (item: { productId: string; productCartQuantity: number }) =>
          item.productId === doc.id
      );
      return {
        id: doc.id,
        ...doc.data(),
        productCartQuantity: cartItem ? cartItem.productQuantity : 0,
      };
    });

    console.log("getCart: cartProducts", cartProducts);

    console.log("getCart: cartItemsArray's data Found, sending now..");
    return res.status(200).json({ cartProducts: cartProducts });
  } catch (error) {
    console.error("getCart: internal errors: ", error);
    return res
      .status(500)
      .json({ error: `getCart: internal server errors! ${error}` });
  }
});

export const getCart = functions.https.onRequest(app);

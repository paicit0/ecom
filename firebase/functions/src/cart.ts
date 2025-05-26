// cart.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import { FieldPath } from "firebase-admin/firestore";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/getCart", async (req, res) => {
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
    console.log("getCart: userDoc exists", userDoc.exists);
    if (!userDoc.exists) {
      console.error("getCart: User's data not found", userEmail);
      return res.status(404).json({ error: "getCart: User's data not found" });
    }

    const cartItemsArray = userDoc.data().cartItemsArray;
    if (cartItemsArray.length === 0) {
      console.log("getCart: No cart items found", { email: userEmail });
      return res.status(200).json({ cartProducts: [] });
    }
    console.log("getCart: cartItemsArray[0]:", cartItemsArray[0]);
    console.log("getCart: cartItemsArray.length:", cartItemsArray.length);

    const productIds = cartItemsArray.map(
      (item: { productId: string; productQuantity: number }) => item.productId
    );

    const productsSnapshot = await db
      .collection("products")
      .where(FieldPath.documentId(), "in", productIds)
      .get();
    console.log("getCart: productsSnapshot.size:", productsSnapshot.size);

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

    console.log("getCart: cartProducts[0].id", cartProducts[0].id);

    console.log("getCart: cartItemsArray's data Found, sending now..");
    return res.status(200).json({ cartProducts: cartProducts });
  } catch (error) {
    console.error("getCart: internal errors: ", error);
    return res
      .status(500)
      .json({ error: `getCart: internal server errors! ${error}` });
  }
});

app.post("/createCart", async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("createCart: req.body:", req.body);
  console.log("createCart: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    return res.status(400).json({
      error: "createCart: no/invalid userEmail or productId in body.",
    });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const usersSnapshot = await db
        .collection("users")
        .where("userEmail", "==", userEmail)
        .get();
      console.log("createCart: usersSnapshot.size:", usersSnapshot.size);

      if (usersSnapshot.empty) {
        console.error("createCart: No user found with userEmail:", userEmail);
        return res.status(404).json({ error: "createCart: User not found." });
      }

      const userDoc = usersSnapshot.docs[0];
      console.log("createCart: userDoc.id:", userDoc.id);

      const userData = userDoc.data() || {};

      const cartItemsArray: { productId: string; productQuantity: number }[] =
        userData.cartItemsArray;

      console.log("createCart: cartItemsArray:", cartItemsArray);

      const updatedCartItems = [...cartItemsArray];

      const existingItemIndex = updatedCartItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        console.log("createCart: Incrementing existing product quantity!");
        updatedCartItems[existingItemIndex] = {
          ...updatedCartItems[existingItemIndex],
          productQuantity:
            updatedCartItems[existingItemIndex].productQuantity + 1,
        };
      } else {
        console.log("createCart: Adding new product to cart");
        updatedCartItems.push({
          productId,
          productQuantity: 1,
        });
      }

      transaction.update(userDoc.ref, { cartItemsArray: updatedCartItems });
      return true;
    });
    return res.status(200).json({
      message: "createCart: finished executing",
    });
  } catch (error) {
    console.error("createCart: internal error:", error);
    return res.status(500).json({ error: "createCart: Internal server error" });
  }
});

app.post("/deleteCart", async (req, res) => {
  const { userEmail, productId } = req.body;

  console.log("deleteCart: req.body:", userEmail, productId);

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "deleteCart: no/invalid userEmail or productId in body.",
    });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const usersSnapshot = await db
        .collection("users")
        .where("userEmail", "==", userEmail)
        .get();
      console.log("deleteCart: usersSnapshot.size:", usersSnapshot.size);

      if (usersSnapshot.empty) {
        console.error("deleteCart: No user found with userEmail:", userEmail);
        return res.status(404).json({ error: "deleteCart: User not found." });
      }

      const userDoc = usersSnapshot.docs[0];
      console.log("deleteCart: userDoc.id:", userDoc.id);

      const userData = userDoc.data() || {};

      const cartItemsArray: { productId: string; productQuantity: number }[] =
        userData.cartItemsArray;

      console.log("deleteCart: cartItemsArray:", cartItemsArray);

      const updatedCartItems = [...cartItemsArray];

      const existingItemIndex = updatedCartItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        console.log("deleteCart: Decreasing existing product quantity by 1");
        updatedCartItems[existingItemIndex] = {
          ...updatedCartItems[existingItemIndex],
          productQuantity:
            updatedCartItems[existingItemIndex].productQuantity - 1,
        };

        if (updatedCartItems[existingItemIndex].productQuantity <= 0) {
          console.log("deleteCart: Removing the product from cart");
          updatedCartItems.splice(existingItemIndex, 1);
        }
      } else {
        console.log(
          "deleteCart: the product you are trying to delete doesn't exist!"
        );
        return res.status(404).json({
          message:
            "deleteCart: the product you are trying to delete doesn't exist!",
        });
      }

      transaction.update(userDoc.ref, { cartItemsArray: updatedCartItems });
      return true;
    });
    return res.status(200).json({
      message: "deleteCart: execution finished",
    });
  } catch (error) {
    console.error("deleteCart: internal error:", error);
    return res.status(401).json({ error: "deleteCart: internal errors" });
  }
});

export const cart = functions.https.onRequest(app);

// addCart.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("addCart: req.body:", req.body);
  console.log("addCart: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    return res.status(400).json({
      error: "addCart: no/invalid userEmail or productId in body.",
    });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const usersSnapshot = await db
        .collection("users")
        .where("userEmail", "==", userEmail)
        .get();
      console.log("addCart: usersSnapshot.size:", usersSnapshot.size);

      if (usersSnapshot.empty) {
        console.error("addCart: No user found with userEmail:", userEmail);
        return res.status(404).json({ error: "addCart: User not found." });
      }

      const userDoc = usersSnapshot.docs[0];
      console.log("addCart: userDoc.id:", userDoc.id);

      const userData = userDoc.data() || {};

      const cartItemsArray: { productId: string; productQuantity: number }[] =
        userData.cartItemsArray;

      console.log("addCart: cartItemsArray:", cartItemsArray);

      const updatedCartItems = [...cartItemsArray];

      const existingItemIndex = updatedCartItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        console.log("addCart: Incrementing existing product quantity!");
        updatedCartItems[existingItemIndex] = {
          ...updatedCartItems[existingItemIndex],
          productQuantity:
            updatedCartItems[existingItemIndex].productQuantity + 1,
        };
      } else {
        console.log("addCart: Adding new product to cart");
        updatedCartItems.push({
          productId,
          productQuantity: 1,
        });
      }

      transaction.update(userDoc.ref, { cartItemsArray: updatedCartItems });
      return true;
    });
    return res.status(200).json({
      message: "addCart: finished executing",
    });
  } catch (error) {
    console.error("addCart: internal error:", error);
    return res.status(500).json({ error: "addCart: Internal server error" });
  }
});

export const addCart = functions.https.onRequest(app);


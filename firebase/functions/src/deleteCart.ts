// deleteCart.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
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

export const deleteCart = functions.https.onRequest(app);

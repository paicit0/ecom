// deleteCart.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const { userEmail, productId } = req.body;

  console.log("deleteCart: req.body: ", userEmail, productId);

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "deleteCart: no/invalid userEmail or productId in body.",
    });
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();

    console.log("deleteCart: usersSnapshot:", usersSnapshot);

    if (usersSnapshot.empty) {
      console.error("deleteCart: No user found with userEmail:", userEmail);
      return res.status(404).json({ error: "deleteCart: User not found." });
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("deleteCart: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "deleteCart: No user data found with userEmail:",
        userEmail
      );
      return res
        .status(404)
        .json({ error: "deleteCart: User data not found." });
    }

    console.log("deleteCart: userDoc updating.");
    await userDoc.ref.update({
      cartItemsArray: FieldValue.arrayRemove(productId),
    });
    return res
      .status(200)
      .json({ message: "deleteCart: Item removed from cartItemsArray" });
  } catch (error) {
    console.error("deleteCart: internal error:", error);
    return res.status(401).json({ error: "deleteCart: internal errors" });
  }
});

export const deleteCart = functions.https.onRequest(app);

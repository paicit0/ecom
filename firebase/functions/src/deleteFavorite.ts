// deleteFavorite.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const { userEmail, productId } = req.body;

  console.log("deleteFavorite: req.body: ", userEmail, productId);

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "deleteFavorite: no/invalid userEmail or productId in body.",
    });
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();

    console.log("deleteFavorite: usersSnapshot:", usersSnapshot);

    if (usersSnapshot.empty) {
      console.error("deleteFavorite: No user found with userEmail:", userEmail);
      return res.status(404).json({ error: "deleteFavorite: User not found." });
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("deleteFavorite: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "deleteFavorite: No user data found with userEmail:",
        userEmail
      );
      return res.status(404).json({ error: "deleteFavorite: User data not found." });
    }

    console.log("deleteFavorite: userDoc updating.");
    await userDoc.ref.update({
      favoriteItemsArray: FieldValue.arrayRemove(productId),
    });
    return res
      .status(200)
      .json({ message: "deleteFavorite: Item removed from favorites" });
  } catch (error) {
    console.error("deleteFavorite: internal error:", error);
    return res.status(401).json({ error: "deleteFavorite: internal errors" });
  }
});

export const deleteFavorite = functions.https.onRequest(app);

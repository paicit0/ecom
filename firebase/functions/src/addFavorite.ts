// addFavorite.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const { userEmail, productId } = req.body;
  console.log("addFavorite: req.body: ", userEmail, productId);

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "addFavorite: no/invalid userEmail or productId in body.",
    });
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    console.log("addFavorite: usersSnapshot.size:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      console.error("addFavorite: No user found with userEmail:", userEmail);
      return res.status(404).json({ error: "addFavorite: User not found." });
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("addFavorite: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "addFavorite: No user data found with userEmail:",
        userEmail
      );
      return res
        .status(404)
        .json({ error: "addFavorite: User data not found." });
    }
    console.log("addFavorite: userDoc updating.");
    await userDoc.ref.update({
      favoriteItemsArray: FieldValue.arrayUnion(productId),
    });
    return res.status(201).json({
      message: "addFavorite: Item added to favoriteItemsArray",
    });
  } catch (error) {
    console.error("addFavorite: internal error:", error);
    return res
      .status(500)
      .json({ error: "addFavorite: Internal server error" });
  }
});

export const addFavorite = functions.https.onRequest(app);

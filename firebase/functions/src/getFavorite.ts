// getFavorite.ts
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
    console.log("getFavorite: req.query: ", userEmail);

    if (!userEmail) {
      console.log("getFavorite: no/invalid userEmail in query!");
      return res
        .status(401)
        .json({ error: "getFavorite: no/invalid userEmail in query!" });
    }

    const usersQuerySnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .limit(1)
      .get();
    console.log(
      "getFavorite: usersQuerySnapshot.size",
      usersQuerySnapshot.size
    );

    if (usersQuerySnapshot.empty) {
      console.error("getFavorite: User not found", userEmail);
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = usersQuerySnapshot.docs[0];
    console.log("getFavorite: userDoc", userDoc);
    if (!userDoc.exists) {
      console.error("getFavorite: User's data not found", userEmail);
      return res
        .status(404)
        .json({ error: "getFavorite: User's data not found" });
    }

    const favoriteItemsArray = userDoc.data().favoriteItemsArray;
    console.log("getFavorite: favoriteItemsArray:", favoriteItemsArray);
    console.log(
      "getFavorite: favoriteItemsArray.length:",
      favoriteItemsArray.length
    );

    if (favoriteItemsArray.length === 0) {
      console.log("getFavorite: No favorite items found", { email: userEmail });
      return res.status(200).json({ favoriteProducts: [] });
    }

    const productsSnapshot = await db
      .collection("products")
      .where(FieldPath.documentId(), "in", favoriteItemsArray)
      .get();
    console.log("getFavorite: productsSnapshot:", productsSnapshot);

    const favoriteProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("getFavorite: favoriteProducts", favoriteProducts);

    console.log("getFavorite: favoriteItemsArray's data Found, sending now..");
    return res.status(200).json({ favoriteProducts: favoriteProducts });
  } catch (error) {
    console.error("getFavorite: internal errors: ", error);
    return res
      .status(500)
      .json({ error: `getFavorite: internal server errors! ${error}` });
  }
});

export const getFavorite = functions.https.onRequest(app);

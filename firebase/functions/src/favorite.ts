// favorite.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/getFavorite", async (req, res) => {
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

app.get("/createFavorite", async (req, res) => {
  const { userEmail, productId } = req.body;
  console.log("createFavorite: req.body: ", userEmail, productId);

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "createFavorite: no/invalid userEmail or productId in body.",
    });
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    console.log("createFavorite: usersSnapshot.size:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      console.error("createFavorite: No user found with userEmail:", userEmail);
      return res.status(404).json({ error: "createFavorite: User not found." });
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("createFavorite: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "createFavorite: No user data found with userEmail:",
        userEmail
      );
      return res
        .status(404)
        .json({ error: "createFavorite: User data not found." });
    }
    console.log("createFavorite: userDoc updating.");
    await userDoc.ref.update({
      favoriteItemsArray: FieldValue.arrayUnion(productId),
    });
    return res.status(201).json({
      message: "createFavorite: Item added to favoriteItemsArray",
    });
  } catch (error) {
    console.error("createFavorite: internal error:", error);
    return res
      .status(500)
      .json({ error: "createFavorite: Internal server error" });
  }
});

app.get("/deleteFavorite", async (req, res) => {
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
      return res
        .status(404)
        .json({ error: "deleteFavorite: User data not found." });
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

export const favorite = functions.https.onRequest(app);

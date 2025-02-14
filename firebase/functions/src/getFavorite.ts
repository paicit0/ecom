// getFavorite.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

const getFavorite = functions.https.onRequest(async (req, res) => {
  try {
    const { userEmail } = req.query;
    const authHeader = req.headers.authorization;
    console.log("getFavorite: req.query: ", userEmail);
    console.log("getFavorite: req.header: ", req.headers.authorization);

    if (!userEmail) {
      console.log("getFavorite: no/invalid userEmail in query!");
      res.status(401).json({ error: "getFavorite: no/invalid userEmail in query!" });
      return;
    }

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("getFavorite: no/invalid auth in headers!");
      res.status(401).json({ error: "getFavorite: no auth in headers!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        console.log("getFavorite: No auth token.");
        res.status(401).json({ error: "getFavorite: No auth token." });
        return;
      }
    } catch (error) {
      console.log("getFavorite: decoding token internal error:", error);
      res.status(401).json({ error: `getFavorite: Unauthorized! ${error}` });
      return;
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
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userDoc = usersQuerySnapshot.docs[0];
    console.log("getFavorite: userDoc", userDoc);
    if (!userDoc.exists) {
      console.error("getFavorite: User's data not found", userEmail);
      res.status(404).json({ error: "getFavorite: User's data not found" });
      return;
    }

    const favoriteItemsArray = userDoc.data().favoriteItemsArray;
    console.log("getFavorite: favoriteItemsArray:", favoriteItemsArray);
    console.log(
      "getFavorite: favoriteItemsArray.length:",
      favoriteItemsArray.length
    );

    if (favoriteItemsArray.length === 0) {
      console.log("getFavorite: No favorite items found", { email: userEmail });
      res.status(200).json({ favoriteProducts: [] });
      return;
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
    res.status(200).json({ favoriteProducts: favoriteProducts });
  } catch (error) {
    console.error("getFavorite: internal errors: ", error);
    res
      .status(500)
      .json({ error: `getFavorite: internal server errors! ${error}` });
  }
});

export { getFavorite };

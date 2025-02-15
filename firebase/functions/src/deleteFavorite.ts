// deleteFavorite.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";

const deleteFavorite = functions.https.onRequest(async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("deleteFavorite: req.body: ", userEmail, productId);
  console.log("deleteFavorite: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    res.status(401).json({
      error: "deleteFavorite: no/invalid userEmail or productId in body.",
    });
    return;
  }

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    console.error("deleteFavorite: no/invalid auth in headers!");
    res
      .status(401)
      .json({ error: "deleteFavorite: no/invalid auth in headers." });
    return;
  }

  const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  console.log("deleteFavorite: idToken:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("deleteFavorite: decodedToken.uid:", decodedToken.uid);

    if (!decodedToken) {
      console.error("deleteFavorite: Failed to decode token");
      res
        .status(401)
        .json({ error: "deleteFavorite: Invalid or missing token." });
      return;
    }

    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();

    console.log("deleteFavorite: usersSnapshot:", usersSnapshot);

    if (usersSnapshot.empty) {
      console.error("deleteFavorite: No user found with userEmail:", userEmail);
      res.status(404).json({ error: "deleteFavorite: User not found." });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("deleteFavorite: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error("deleteFavorite: No user data found with userEmail:", userEmail);
      res.status(404).json({ error: "deleteFavorite: User data not found." });
      return;
    }

    console.log("deleteFavorite: userDoc updating.");
    await userDoc.ref.update({
      favoriteItemsArray: FieldValue.arrayRemove(productId),
    });
    res
      .status(200)
      .json({ message: "deleteFavorite: Item removed from favorites" });
  } catch (error) {
    console.error("deleteFavorite: internal error:", error);
    res.status(401).json({ error: "deleteFavorite: internal errors" });
    return;
  }
});

export { deleteFavorite };

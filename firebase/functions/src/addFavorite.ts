// addFavorite.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";

const addFavorite = functions.https.onRequest(async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("addFavorite: req.body: ", userEmail, productId);
  console.log("addFavorite: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    res.status(401).json({
      error: "addFavorite: no/invalid userEmail or productId in body.",
    });
    return;
  }

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    console.error("addFavorite: no/invalid auth in headers!");
    res.status(401).json({ error: "addFavorite: no/invalid auth in headers." });
    return;
  }

  const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  console.log("addFavorite: idToken:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("addFavorite: decodedToken.uid:", decodedToken.uid);

    if (!decodedToken) {
      console.error("addFavorite: Failed to decode token");
      res.status(401).json({ error: "addFavorite: Invalid or missing token." });
      return;
    }

    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    console.log("addFavorite: usersSnapshot.size:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      console.error("addFavorite: No user found with userEmail:", userEmail);
      res.status(404).json({ error: "addFavorite: User not found." });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("addFavorite: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error("addFavorite: No user data found with userEmail:", userEmail);
      res.status(404).json({ error: "addFavorite: User data not found." });
      return;
    }
    console.log("addFavorite: userDoc updating.");
    await userDoc.ref.update({
      favoriteItemsArray: FieldValue.arrayUnion(productId),
    });
    res.status(201).json({
      message: "addFavorite: Item added to favorites",
    });
  } catch (error) {
    console.error("addFavorite: internal error:", error);
    res.status(500).json({ error: "addFavorite: Internal server error" });
    return;
  }
});

export { addFavorite };

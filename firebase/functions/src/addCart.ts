// addCart.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";

const addCart = functions.https.onRequest(async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("addCart: req.body: ", userEmail, productId);
  console.log("addCart: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    res.status(401).json({
      error: "addCart: no/invalid userEmail or productId in body.",
    });
    return;
  }

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    console.error("addCart: no/invalid auth in headers!");
    res.status(401).json({ error: "addCart: no/invalid auth in headers." });
    return;
  }

  const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  console.log("addCart: idToken:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("addCart: decodedToken.uid:", decodedToken.uid);

    if (!decodedToken) {
      console.error("addCart: Failed to decode token");
      res.status(401).json({ error: "addCart: Invalid or missing token." });
      return;
    }

    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    console.log("addCart: usersSnapshot.size:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      console.error("addCart: No user found with userEmail:", userEmail);
      res.status(404).json({ error: "addCart: User not found." });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("addCart: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error("addCart: No user data found with userEmail:", userEmail);
      res.status(404).json({ error: "addCart: User data not found." });
      return;
    }
    console.log("addCart: userDoc updating.");
    await userDoc.ref.update({
      cartItemsArray: FieldValue.arrayUnion(productId),
    });
    res.status(201).json({
      message: "addCart: Item added to cartItemsArray",
    });
  } catch (error) {
    console.error("addCart: internal error:", error);
    res.status(500).json({ error: "addCart: Internal server error" });
    return;
  }
});

export { addCart };

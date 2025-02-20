// deleteCart.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";

const deleteCart = functions.https.onRequest(async (req, res) => {
  const { userEmail, productId } = req.body;
  const authHeader = req.headers.authorization;

  console.log("deleteCart: req.body: ", userEmail, productId);
  console.log("deleteCart: req.headers.authorization:", authHeader);

  if (!userEmail || !productId) {
    res.status(401).json({
      error: "deleteCart: no/invalid userEmail or productId in body.",
    });
    return;
  }

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    console.error("deleteCart: no/invalid auth in headers!");
    res.status(401).json({ error: "deleteCart: no/invalid auth in headers." });
    return;
  }

  const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  console.log("deleteCart: idToken:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("deleteCart: decodedToken.uid:", decodedToken.uid);

    if (!decodedToken) {
      console.error("deleteCart: Failed to decode token");
      res.status(401).json({ error: "deleteCart: Invalid or missing token." });
      return;
    }

    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();

    console.log("deleteCart: usersSnapshot:", usersSnapshot);

    if (usersSnapshot.empty) {
      console.error("deleteCart: No user found with userEmail:", userEmail);
      res.status(404).json({ error: "deleteCart: User not found." });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("deleteCart: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "deleteCart: No user data found with userEmail:",
        userEmail
      );
      res.status(404).json({ error: "deleteCart: User data not found." });
      return;
    }

    console.log("deleteCart: userDoc updating.");
    await userDoc.ref.update({
      cartItemsArray: FieldValue.arrayRemove(productId),
    });
    res
      .status(200)
      .json({ message: "deleteCart: Item removed from cartItemsArray" });
  } catch (error) {
    console.error("deleteCart: internal error:", error);
    res.status(401).json({ error: "deleteCart: internal errors" });
    return;
  }
});

export { deleteCart };

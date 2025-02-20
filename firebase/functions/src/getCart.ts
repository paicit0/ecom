// getCart.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

const getCart = functions.https.onRequest(async (req, res) => {
  try {
    const { userEmail } = req.query;
    const authHeader = req.headers.authorization;
    console.log("getCart: req.query: ", userEmail);
    console.log("getCart: req.header: ", req.headers.authorization);

    if (!userEmail) {
      console.log("getCart: no/invalid userEmail in query!");
      res.status(401).json({ error: "getCart: no/invalid userEmail in query!" });
      return;
    }

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("getCart: no/invalid auth in headers!");
      res.status(401).json({ error: "getCart: no auth in headers!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        console.log("getCart: No auth token.");
        res.status(401).json({ error: "getCart: No auth token." });
        return;
      }
    } catch (error) {
      console.log("getCart: decoding token internal error:", error);
      res.status(401).json({ error: `getCart: Unauthorized! ${error}` });
      return;
    }

    const usersQuerySnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .limit(1)
      .get();
    console.log(
      "getCart: usersQuerySnapshot.size",
      usersQuerySnapshot.size
    );

    if (usersQuerySnapshot.empty) {
      console.error("getCart: User not found", userEmail);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userDoc = usersQuerySnapshot.docs[0];
    console.log("getCart: userDoc", userDoc);
    if (!userDoc.exists) {
      console.error("getCart: User's data not found", userEmail);
      res.status(404).json({ error: "getCart: User's data not found" });
      return;
    }

    const cartItemsArray = userDoc.data().cartItemsArray;
    console.log("getCart: cartItemsArray:", cartItemsArray);
    console.log(
      "getCart: cartItemsArray.length:",
      cartItemsArray.length
    );

    if (cartItemsArray.length === 0) {
      console.log("getCart: No cart items found", { email: userEmail });
      res.status(200).json({ cartProducts: [] });
      return;
    }

    const productsSnapshot = await db
      .collection("products")
      .where(FieldPath.documentId(), "in", cartItemsArray)
      .get();
    console.log("getCart: productsSnapshot:", productsSnapshot);

    const cartProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("getCart: cartProducts", cartProducts);

    console.log("getCart: cartItemsArray's data Found, sending now..");
    res.status(200).json({ cartProducts: cartProducts });
  } catch (error) {
    console.error("getCart: internal errors: ", error);
    res
      .status(500)
      .json({ error: `getCart: internal server errors! ${error}` });
  }
});

export { getCart };

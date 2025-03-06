// addPurchase.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const { userEmail, productId, productPrice, location } = req.body;
  console.log("addPurchase: req.body: ", req.body);
  console.log(
    "addPurchase: req.headers.authorization:",
    productPrice,
    location
  );

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "addPurchase: no/invalid userEmail or productId in body.",
    });
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    console.log("addPurchase: usersSnapshot.size:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      console.error("addPurchase: No user found with userEmail:", userEmail);
      return res.status(404).json({ error: "addPurchase: User not found." });
    }

    const userDoc = usersSnapshot.docs[0];
    console.log("addPurchase: userDoc.id:", userDoc.id);
    if (!userDoc.exists) {
      console.error(
        "addPurchase: No user data found with userEmail:",
        userEmail
      );
      return res
        .status(404)
        .json({ error: "addPurchase: User data not found." });
    }
    console.log("addPurchase: userDoc updating.");
    await userDoc.ref.update({
      purchaseItemsArray: FieldValue.arrayUnion(productId),
    });
    return res.status(201).json({
      message: "addPurchase: Item added to purchaseItemsArray",
    });
  } catch (error) {
    console.error("addPurchase: internal error:", error);
    return res
      .status(500)
      .json({ error: "addPurchase: Internal server error" });
  }
});

export const addPurchase = functions.https.onRequest(app);

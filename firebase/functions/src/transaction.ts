// transaction.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express, { Request, Response } from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/getTransaction", async (req: Request, res: Response) => {
  return res.status(200).json({ message: "success!" });
});

app.post("/addTransaction", async (req: Request, res: Response) => {
  const { userEmail, productId, productPrice, location } = req.body;
  console.log("addTransaction: req.body: ", req.body);
  console.log(
    "addTransaction: req.headers.authorization:",
    productPrice,
    location
  );

  if (!userEmail || !productId) {
    return res.status(401).json({
      error: "addTransaction: no/invalid userEmail or productId in body.",
    });
  }

  try {
    await db.runTransaction(async (transaction) => {
      const usersSnapshot = await db
        .collection("users")
        .where("userEmail", "==", userEmail)
        .get();
      console.log("addTransaction: usersSnapshot.size:", usersSnapshot.size);

      if (usersSnapshot.empty) {
        console.error(
          "addTransaction: No user found with userEmail:",
          userEmail
        );
        return res
          .status(404)
          .json({ error: "addTransaction: User not found." });
      }

      const userDoc = usersSnapshot.docs[0];
      console.log("addTransaction: userDoc.id:", userDoc.id);
      if (!userDoc.exists) {
        console.error(
          "addTransaction: No user data found with userEmail:",
          userEmail
        );
        return res
          .status(404)
          .json({ error: "addTransaction: User data not found." });
      }
      console.log("addTransaction: userDoc updating.");
      transaction.update(userDoc.ref, {
        transactionItemsArray: FieldValue.arrayUnion(productId),
      });
      return res.status(201).json({
        message: "addTransaction: Item added to transactionItemsArray",
      });
    });

    return res.status(200).json({
      message: "addTransaction: execution completed",
    });
  } catch (error) {
    console.error("addTransaction: internal error:", error);
    return res
      .status(500)
      .json({ error: "addTransaction: Internal server error" });
  }
});

export const transaction = functions.https.onRequest(app);

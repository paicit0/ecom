// transaction.ts
import * as functions from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

type CheckoutProducts = {
  productPrice: number;
  productName: string;
  productQuantity?: number;
  productId: string;
  productImg: string;
};

type transactionObjType = {
  userEmail: string;
  sellerEmail: string;
  productsObj: CheckoutProducts[];
  productPrice: number;
  location: string;
};

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/getTransaction", async (req: Request, res: Response) => {
  return res.status(200).json({ message: "success!" });
});

app.post("/addTransaction", async (req: Request, res: Response) => {
  const {
    userEmail,
    sellerEmail,
    productsObj,
    productPrice,
    location,
  }: transactionObjType = req.body;
  console.log("addTransaction: req.body: ", req.body);

  if (
    !userEmail ||
    !sellerEmail ||
    !productsObj ||
    !productPrice ||
    !location
  ) {
    return res.status(400).json({
      error: "addTransaction: missing required fields in body.",
    });
  }

  try {
    const uuid = uuidv4();
    const transactionUUID = "transaction" + uuid;
    console.log("addTransaction: transactionUUID:", transactionUUID);
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
        transactionItemsArray: FieldValue.arrayUnion({
          ...req.body,
          transactionId: transactionUUID,
        }),
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

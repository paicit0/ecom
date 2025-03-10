import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.get("/getUser", async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log("customer/: req.query:", req.query);
    const userRef = db.collection("users").where("userEmail", "==", userEmail);
    const userDoc = await userRef.get();
    if (userDoc.empty) {
      console.log("getUser: No user found with email", userEmail);
      return res.status(404).json({ message: "No user found" });
    }
    const userData = userDoc.docs[0].data();
    if (userData.customerIdStripe) {
      return res.status(200).json({ customerIdStripe: userData.customerIdStripe });
    } else {
      console.log("getUser: No customerId field found on user data", userData);
      return res.status(404).json({ message: "No customerId field found" });
    }
  } catch (error) {
    console.error("getUser: ", error);
    return res.status(500).json({ error: error });
  }
});

export const user = functions.https.onRequest(app);

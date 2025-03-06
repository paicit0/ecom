// registerSellers.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  console.log("registerSellers");
  try {
    const { email } = req.body;

    if (!email) {
      console.log("No email received!");
      return res
        .status(404)
        .json({ message: "Error 404: Didn't receive an email" });
    }

    const userRef = db.collection("users").where("userEmail", "==", email);
    const getUser = await userRef.get();

    if (getUser.empty) {
      console.log("No such user exists!");
      return res.status(404).json({ message: "Error 404: No user found" });
    } else {
      const userDocRef = getUser.docs[0].ref;
      await userDocRef.update({ userRole: "seller" });
      return res
        .status(200)
        .json({ message: "Success 200: userRole changed to seller" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Error 500: Registering failed on registerSellers Cloud Function.",
      error: error,
    });
  }
});

export const registerSellers = functions.https.onRequest(app);

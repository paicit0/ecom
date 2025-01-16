import * as functions from "firebase-functions";
import { db } from "./index";

const registerSellers = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      console.log("No email received!");
      res.status(404).json({ message: "Error 404: Didn't receive an email" });
      return;
    }

    const userRef = db.collection("users").where("email", "==", email);
    const getUser = await userRef.get();

    if (getUser.empty) {
      console.log("No such user exists!");
      res.status(404).json({ message: "Error 404: No user found" });
      return;
    } else {
      const userDocRef = getUser.docs[0].ref;
      await userDocRef.update({ role: "seller" });
      res.status(200).json({ message: "Success 200: Role changed to seller" });
    }
  } catch (error) {
    res.status(500).json({
      message:
        "Error 500: Registering failed on registerSellers Cloud Function.",
      error: error,
    });
  }
});

export { registerSellers };

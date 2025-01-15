import * as functions from "firebase-functions";
import { db } from "./index";

const registerSellers = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(404).json({ message: "Error 404: No user found" });
    }

    const userRef = db.collection("users").doc(email);
    const getUser = await userRef.get();

    if (!getUser.exists) {
      res.status(404).json({ message: "Error 404: No user found" });
    } else {
      const updateRole = await userRef.update({ role: "seller" });
      res
        .status(400)
        .json({ message: "Success 400: Role changed to seller" + updateRole });
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

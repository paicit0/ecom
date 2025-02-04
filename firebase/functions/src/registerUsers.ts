import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";

const registerUsers = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Connected! Proceeding...");
    const { email } = await req.body;
    const usersCollectionEmail = db.collection("users").doc(email);
    const docGet = await usersCollectionEmail.get();

    const user = {
      email: email,
      pictureURL: "",
      timestamp: Timestamp.now(),
      role: "normalUser",
      balance: 0,
      cartItemsArray: [],
      favoriteItemsArray: [],
    };

    if (!email) {
      res.status(400).json({ message: "No email provided" });
      return;
    }

    if (docGet.exists) {
      console.log("User already exists!");
      res.status(409).json({ message: "User already exists!" });
      return;
    } else {
      const addUser = await db.collection("users").add(user);
      const addUserGet = await addUser.get();
      console.log("User registered successfully! ID: ", addUserGet.id);
      res.status(201).json({
        message: "User registered successfully! ID: ",
        id: addUserGet.id,
      });
    }
  } catch (error) {
    console.log("Registering failed: " + error);
    res
      .status(500)
      .json({ message: "Registering failed on Cloud Function." }); // don't include "error" due to security risk.
  }
});

export { registerUsers };

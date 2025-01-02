import * as functions from "firebase-functions";
import { db } from "./index";
import bcryptjs from "bcryptjs";
import { Timestamp } from "firebase-admin/firestore";

const registerUsers = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Connected! Proceeding...");
    const { email, password } = req.body;
    const docRef = db.collection("users").doc(email);
    const docGet = await docRef.get();

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = {
      email: email,
      password: hashedPassword,
      timestamp: Timestamp.now(),
    };

    if (!email || !password) {
      res.status(400).json({ message: "No email or password provided" });
    }

    if (docGet.exists) {
      console.log("User already exists!");
      res.status(409).json({ message: "User already exists!" });
      return;
    } else {
      const addUser = await db.collection("users").add(user);
      console.log("User registered successfully! ID: ", addUser.id);
      res.status(201).json({
        message: "User registered successfully! ID: ",
        id: addUser.id,
      });
    }
  } catch (error) {
    console.log("Registering failed: " + error);
    res.status(500).json({ message: "Registering failed" }); // don't include "error" due to security risk.
  }
});

export { registerUsers };

import * as functions from "firebase-functions";
import { db } from "./index";
import bcryptjs from "bcryptjs";
import * as admin from "firebase-admin";

const registerUsers = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Connected! Proceeding...");

    const docRef = db.collection("users").doc(req.body.email);
    const docGet = await docRef.get();

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(403).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    

    if (!req.body.email || !req.body.password) {
      res.status(400).json({ message: "No email or password provided" });
    }

    if (docGet.exists) {
      console.log("User already exists!");
      res.status(409).json({ message: "User already exists!" });
      return;
    } else {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded Token:", decodedToken);
      console.log("Token verified:", decodedToken.uid);

      await admin.auth().createUser({
        email: req.body.email,
        password: hashedPassword,
      });
      console.log("User registered successfully! Username: " + req.body.email);
      res.status(201).json({
        message: "User registered successfully! Username: ",
        username: req.body.email,
      });
    }
  } catch (error) {
    console.log("Registering failed: " + error);
    res.status(500).json({ message: "Registering failed" }); // don't include "error" due to security risk.
  }
});

export { registerUsers };

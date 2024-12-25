import * as functions from "firebase-functions";
import {db} from "./index";
import bcryptjs from "bcryptjs";

const registerUsers = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Connected! Proceeding...");

    const docRef = db.collection("users").doc(req.body.userName);
    const docGet = await docRef.get();

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hash(req.body.password, salt);

    if (docGet.exists) {
      console.log("User already exists!");
      res.json({message: "User already exists!"});
      return;
    } else {
      await docRef.set({
        userName: req.body.userName,
        password: hashedPassword,
      });
      console.log("User registered successfully! Username: " + req.body.userName);
      res.json({message: "User registered successfully! Username: ", username: req.body.userName});
    }
  } catch (error) {
    console.log("Registering failed: " + error);
    res.status(500).json({message: "Registering failed"}); // don't include "error" due to security risk.
  }
  return;
});

export {registerUsers};


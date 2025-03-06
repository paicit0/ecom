// registerUsers.ts
import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";
import express from "express";

const app = express();

app.post("/", async (req, res) => {
  try {
    console.log("registerUsers: Connected.");
    const { email } = await req.body;
    console.log("registerUsers: req.body", req.body);
    const usersCollectionEmail = db.collection("users").doc(email);
    const docGet = await usersCollectionEmail.get();

    const user = {
      userEmail: email,
      userPictureURL: "",
      userTimestamp: Timestamp.now(),
      userRole: "normalUser",
      userBalance: 0,
      cartItemsArray: [],
      favoriteItemsArray: [],
    };

    if (!email) {
      return res
        .status(400)
        .json({ message: "registerUsers: No email provided" });
    }

    if (docGet.exists) {
      console.log("registerUsers: User already exists!");
      return res
        .status(409)
        .json({ message: "registerUsers: User already exists!" });
    } else {
      const addUser = await db.collection("users").add(user);
      console.log(
        "registerUsers: User registered successfully! DocumentID: ",
        addUser.id
      );
      const userWithId = { ...user, userId: addUser.id };
      await db.collection("users").doc(addUser.id).set(userWithId);
      return res.status(201).json({
        message: "registerUsers: User registered successfully!",
        userId: addUser.id,
      });
    }
  } catch (error) {
    console.log("registerUsers: Registering failed: " + error);
    return res
      .status(500)
      .json({ message: "registerUsers: Registering failed" });
  }
});

export const registerUsers = functions.https.onRequest(app);

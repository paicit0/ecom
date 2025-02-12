import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const updateCart = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateCart: req.body:", req.body);
    const { email, cartItemsArray } = req.body;
    const authHeader = req.headers.authorization;

    console.log("updateCart: req.body: ", email, cartItemsArray);
    console.log("updateCart: received req.headers.authorization:", authHeader);

    if (!email || !cartItemsArray) {
      res
        .status(401)
        .json({
          error: "updateCart: no/invalid email or cartItemsArray in body.",
        });
      return;
    }

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.error("updateCart: no/invalid auth in headers!");
      res
        .status(401)
        .json({ error: "updateCart: no/invalid auth in headers." });
      return;
    }

    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    console.log("updateCart: idToken:", idToken);

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("updateCart: decodedToken.uid:", decodedToken.uid);

      if (!decodedToken) {
        console.error("updateCart: Failed to decode token");
        res
          .status(401)
          .json({ error: "updateCart: Invalid or missing token." });
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: `updateCart: Unauthorized! ${error}` });
      return;
    }

    console.log(
      "updateCart: in collection 'users', finding a document with 'email'=",
      email
    );
    const usersRef = db.collection("users").where("userEmail", "==", email);
    console.log("updateCart: usersRef:", usersRef);
    const usersQuerySnapshot = await usersRef.get();
    console.log("updateCart: usersQuerySnapshot:", usersQuerySnapshot);
    if (!usersQuerySnapshot.empty) {
      console.log("updateCart: usersDoc exists!");
      const usersDocRef = usersQuerySnapshot.docs[0].ref;
      console.log("updateCart: usersDocRef:", usersDocRef);
      await usersDocRef.set(
        { cartItemsArray: cartItemsArray },
        { merge: true }
      );
      console.log(`updateCart: cartItemsArray updated! user: ${email}`);
      res.status(201).json({
        message: `updateCart: cartItemsArray updated! user: ${email}`,
      });
      return;
    } else {
      console.error("updateCart: cartItemsArray not found.");
      res.status(404).json({ error: "updateCart: cartItemsArray not found." });
    }
  } catch (error) {
    console.error("updateCart: internal errors: ", error);
    res.status(400).json({ error: "updateCart: internal errors" });
  }
});

export { updateCart };

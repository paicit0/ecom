import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const updateFavorite = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateFavorite: req.body:", req.body);
    const { email, favoriteItemsArray } = req.body;
    const authHeader = req.headers.authorization;

    console.log("updateFavorite: req.body: ", email, favoriteItemsArray);
    console.log("updateFavorite: req.headers.authorization:", authHeader);

    if (!email || !favoriteItemsArray) {
      res.status(401).json({
        error:
          "updateFavorite: no/invalid email or favoriteItemsArray in body.",
      });
      return;
    }

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.error("updateFavorite: no/invalid auth in headers!");
      res
        .status(401)
        .json({ error: "updateFavorite: no/invalid auth in headers." });
      return;
    }

    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    console.log("updateFavorite: idToken:", idToken);

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("updateFavorite: decodedToken.uid:", decodedToken.uid);

      if (!decodedToken) {
        console.error("updateFavorite: Failed to decode token");
        res
          .status(401)
          .json({ error: "updateFavorite: Invalid or missing token." });
        return;
      }
    } catch (error) {
      console.error("updateFavorite: decoding token internal error:", error);
      res.status(401).json({ error: `updateFavorite: Unauthorized! ${error}` });
      return;
    }
    console.log(
      "updateFavorite: in collection 'users', finding a document with 'email'=",
      email
    );
    const usersRef = db.collection("users").where("email", "==", email);
    console.log("updateFavorite: usersRef", usersRef);
    const usersQuerySnapshot = await usersRef.get();
    console.log("updateFavorite: usersQuerySnapshot", usersQuerySnapshot);
    if (!usersQuerySnapshot.empty) {
      console.log("updateFavorite: usersQuerySnapshot Found!");
      const usersDocRef = usersQuerySnapshot.docs[0].ref;
      console.log("updateFavorite: usersDocRef:", usersDocRef);
      await usersDocRef.set(
        { favoriteItemsArray: favoriteItemsArray },
        { merge: true }
      );
      console.log(
        `updateFavorite: favoriteItemsArray updated! user email:${email}`
      );
      res.status(201).json({
        message: `updateFavorite: favoriteItemsArray updated! user email:${email}`,
      });
      return;
    } else {
      console.error("updateFavorite: usersDoc not Found");
      res
        .status(404)
        .json({ error: "updateFavorite: favoriteItemsArray not found." });
    }
  } catch (error) {
    console.error("updateFavorite: internal errors: ", error);
    res.status(400).json({ error: "updateFavorite: internal errors" });
  }
});

export { updateFavorite };

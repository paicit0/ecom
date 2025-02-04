import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const updateFavorite = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateFavorite: req.body:", req.body);
    const { favorite, id } = req.body;
    const authHeader = req.headers.authorization;
    console.log("updateFavorite: received req.body: ", req.body);
    console.log("updateFavorite: received authHeader: ", authHeader);
    console.log("updateFavorite: received favorite: ", favorite);

    console.log("updateFavorite received headers:", authHeader);
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("updateFavorite: no/invalid auth in headers!");
      res
        .status(401)
        .json({ error: "updateFavorite: no/invalid auth in headers." });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        res.status(401).json({ error: "updateFavorite: No auth token." });
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: `updateFavorite: Unauthorized! ${error}` });
      return;
    }

    const favoriteRef = db.collection("user").doc(id);
    const favoriteDoc = await favoriteRef.get();
    if (!favoriteDoc.exists) {
      res.status(404);
    } else {
      // const favoriteDocRef = favoriteDoc.docs[0].ref;
      // await favoriteDocRef.update({ favorite });
      res.status(200);
    }

    res.status(200);
  } catch (error) {
    console.log("getProducts error: ", error);
    res.status(400);
  }
});

export { updateFavorite };

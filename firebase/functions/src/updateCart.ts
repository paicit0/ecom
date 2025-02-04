import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const updateCart = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateCart: req.body:", req.body);
    const { cart, cartOwnerId } = req.body;
    const authHeader = req.headers.authorization;
    console.log("updateCart: req.body: ", req.body);
    console.log("updateCart: authHeader: ", authHeader);

    console.log("updateCart received headers:", authHeader);
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("updateCart: no/invalid auth in headers!");
      res
        .status(401)
        .json({ error: "updateCart: no/invalid auth in headers." });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        res.status(401).json({ error: "updateCart: No auth token." });
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: `updateCart: Unauthorized! ${error}` });
      return;
    }

    const cartRef = db.collection("cart");
    const getCart = await cartRef.where("cartOwnerId", "==", cartOwnerId).get();
    if (getCart.empty) {
      res.status(404);
    } else {
      const cartDocRef = getCart.docs[0].ref;
      await cartDocRef.update({ cart });
      res.status(200);
    }

    res.status(200);
  } catch (error) {
    console.log("getProducts error: ", error);
    res.status(400);
  }
});

export { updateCart };

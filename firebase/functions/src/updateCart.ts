import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const updateCart = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateCart req.body: ", req.body);
    const { cart, cartOwnerId } = req.body;
    console.log("req.body: ", cart);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;
    console.log("req.header bearer: ", idToken);
    console.log("userEmail:", userEmail);

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

import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const getCart = functions.https.onRequest(async (req, res) => {
  try {
    console.log("getCart: req.header: ", req.headers.authorization);
    console.log("getCart: req.body: ", req.query);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("getCart: no/invalid auth in headers!");
      res.status(401).json({ error: "getCart: no auth in headers!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        console.log("getCart: No auth token.");
        res.status(401).json({ error: "getCart: No auth token." });
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: `getCart: Unauthorized! ${error}` });
      return;
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: `getCart: internal server errors! ${error}` });
  }

  const usersRef = db.collection("users");
  console.log(usersRef);
});

export { getCart };

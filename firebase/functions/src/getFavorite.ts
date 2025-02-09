import * as functions from "firebase-functions";
import { db } from "./index";
import * as admin from "firebase-admin";

const getFavorite = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.query;
    const authHeader = req.headers.authorization;
    console.log("getFavorite: req.body: ", req.query);
    console.log("getFavorite: req.header: ", req.headers.authorization);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
      console.log("getFavorite: no/invalid auth in headers!");
      res.status(401).json({ error: "getFavorite: no auth in headers!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        console.log("getFavorite: No auth token.");
        res.status(401).json({ error: "getFavorite: No auth token." });
        return;
      }
    } catch (error) {
      console.log("getFavorite: decoding token internal error:", error);
      res.status(401).json({ error: `getFavorite: Unauthorized! ${error}` });
      return;
    }

    const usersRef = db.collection("users").where("email", "==", email);
    console.log("getFavorite: usersRef", usersRef);
    const usersQuerySnapshot = await usersRef.get();
    console.log("getFavorite: usersQuerySnapshot", usersQuerySnapshot);
    const usersDoc = usersQuerySnapshot.docs[0];
    console.log("getFavorite: usersDoc:", usersDoc);
    const usersDocData = usersDoc.data();
    const favoriteItemsArray = usersDocData.favoriteItemsArray;
    console.log("getFavorite: favoriteItemsArray:", favoriteItemsArray);

    if (favoriteItemsArray) {
      console.log(
        "getFavorite: favoriteItemsArray.length:",
        favoriteItemsArray.length
      );
      const productsSnapshot = await db
        .collection("products")
        .where("id", "in", favoriteItemsArray)
        .get();
      const favoriteProducts = productsSnapshot.docs.map((doc) => doc.data());
      console.log("getFavorite: favoriteProducts", favoriteProducts);

      console.log(
        "getFavorite: favoriteItemsArray's data Found, sending now.."
      );
      res.status(200).json({ favoriteProducts: favoriteProducts });
    }
  } catch (error) {
    console.error("getFavorite: internal errors: ", error);
    res
      .status(500)
      .json({ error: `getFavorite: internal server errors! ${error}` });
  }
});

export { getFavorite };

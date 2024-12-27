import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const securedToken = functions.https.onRequest(async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      res.json({ message: "Authorized" + uid });
    } else {
      console.error("Error getting token.");
      res.status(403).send({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error getting token.");
    res.status(403).send({ message: "Unauthorized" });
  }
});

export { securedToken };

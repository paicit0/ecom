import * as functions from "firebase-functions";

export const registerFirestore = functions.https.onRequest((req, res) => {
  res.send("Register endpoint!");
});


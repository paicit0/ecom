import * as functions from "firebase-functions";
import { db } from "./index";

const updateUser = functions.https.onRequest(async (req, res) => {
  try {
    console.log("updateUser req.body: ", req.body);
    const { email, cart, favorite } = req.body;
    const userDocRef = db.collection("users").where("email", "==", email);
    const getUser = await userDocRef.get();
    if (!getUser.empty) {
      const updateDoc = await getUser.docs[0].ref.update({
        cart: cart,
        favorite: favorite,
      });
      console.log(updateDoc);
      res.status(200);
    }
  } catch (error) {
    console.log("updateUser error: ", error);
    res.status(500).json({ error: error });
  }
});

export { updateUser };

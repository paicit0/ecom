import * as functions from "firebase-functions";
import {db} from "./index";
import bcryptjs from "bcryptjs";

const registerUsers = functions.https.onRequest(async (req, res) => {
  try {
    const docRef = db.collection("user").doc("register");
    const docGet = await docRef.get();

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hash(req.body.password, salt);

    if (docGet.exists) {
      res.send("User already exists!");
    } else {
      await docRef.set({
        userName: req.body.userName,
        password: hashedPassword,
      });
    }
  } catch (error) {
    console.log(error);
  }
  return;
});

export {registerUsers};


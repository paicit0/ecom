import * as functions from "firebase-functions";
import { db } from "./index";
import bcryptjs, { compare } from "bcryptjs";

const loginUsers = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password } = req.body;

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const userRef = db.collection("users");
    const emailRef = userRef.where("email", "==", email);
    // const passwordRef = db.collection("users").doc(hashedPassword);

    const getEmail = await emailRef.get();

    if (!getEmail.empty) {
      console.log("User exists!");
      if (await compare(password, hashedPassword)) {
        console.log("Authorized the password!");
        res.status(200).json({ message: "Authorized" });
      }
    } else {
      console.log("User doesn't exist.");
      res.status(404).json({ message: "User doesn't exist." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error!" });
  }
});

export { loginUsers };

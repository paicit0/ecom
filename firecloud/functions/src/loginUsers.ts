import * as functions from "firebase-functions";
import { db } from "./index";
import { compare } from "bcryptjs";

const loginUsers = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const userRef = db.collection("users");
    const emailRef = userRef.where("email", "==", email);
    const getEmail = await emailRef.get();

    if (getEmail.empty) {
      console.log("User doesn't exist.");
      res.status(404).json({ message: "User doesn't exist." });
    }

    console.log("User exists!");
    const userData = getEmail.docs[0].data();
    const hashedPassword = userData.password;

    const validPassword = await compare(password, hashedPassword);

    if (validPassword) {
      console.log("Password Matched!");
      res.status(200).json({ message: "Authentication successful!", jwt: "jwt Token here" });
    } else {
      console.log("Password Doesn't Match!");
      res.status(401).json({ message: "Invalid password." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An internal error occurred." });
  }
});

export { loginUsers };

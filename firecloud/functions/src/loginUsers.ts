import * as functions from "firebase-functions";
import { db } from "./index";
import { compare } from "bcryptjs";
import * as jwt from "jsonwebtoken";

const loginUsers = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const userRef = db.collection("users");
    const emailRef = userRef.where("email", "==", email);
    const getUserInfoFromEmail = await emailRef.get();

    if (getUserInfoFromEmail.empty) {
      console.log("User doesn't exist.");
      res.status(404).json({ message: "User doesn't exist." });
    }

    console.log("User exists!");
    const userData = getUserInfoFromEmail.docs[0].data();
    const hashedPassword = userData.password;

    const validPassword = await compare(password, hashedPassword);

    const generateJWT = jwt.sign(
      { foo: "bar" },
      "privatekey",
      { algorithm: "RS256" },
      (err: unknown, token: unknown) => {
        console.log(generateJWT, token);
        if (err) {
          console.log(err);
        }
      }
    );

    if (validPassword) {
      console.log("Password Matched!");
      res
        .status(200)
        .json({ message: "Authentication successful!", jwt: generateJWT, email: email, role: userData.role });
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

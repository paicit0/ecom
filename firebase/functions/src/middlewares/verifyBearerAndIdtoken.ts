// middlewares/verifyBearerAndIdtoken.ts
import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

const verifyBearerAndIdtoken = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(
    "verifyBearerAndIdtoken: req.header: ",
    req.headers.authorization
  );
  console.log("verifyBearerAndIdtoken: req.body: ", req.body);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    console.log("verifyBearerAndIdtoken: no/invalid auth in headers!");
    res
      .status(401)
      .json({ error: "verifyBearerAndIdtoken: no auth in headers!" });
    return;
  }
  const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken) {
      console.log("verifyBearerAndIdtoken: No auth token.");
      res.status(401).json({ error: "verifyBearerAndIdtoken: No auth token." });
      return;
    }
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ error: `verifyBearerAndIdtoken: Unauthorized! ${error}` });
    return;
  }
  next();
};

export default verifyBearerAndIdtoken;

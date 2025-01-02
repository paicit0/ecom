/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "../../firebaseConfig";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// functions

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

import { registerUsers } from "./registerUsers";
export { registerUsers };

import { securedToken } from "./securedToken";
export { securedToken };

import { loginUsers } from "./loginUsers";
export { loginUsers };

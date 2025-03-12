// "npm run build" everytime after an update in "functions" folder first before starting the emulator
// firebase emulators:start --import=./firebase-export --export-on-exit=./firebase-export
// use http://10.0.2.2:5001 for android emulator
// index.ts
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./configs/firebaseConfig";
import dotenv from "dotenv";

dotenv.config();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("index: CURRENT_APP_MODE=", process.env.CURRENT_APP_MODE);

if (process.env.CURRENT_APP_MODE === "prod") {
  console.log = function noConsole() {};
  console.error = function noConsole() {};
  console.warn = function noConsole() {};
  console.debug = function noConsole() {};
}

export { db };

import { registerUsers } from "./registerUsers";
export { registerUsers };

import { registerSellers } from "./registerSellers";
export { registerSellers };

import { uploadAwsS3 } from "./uploadAwsS3";
export { uploadAwsS3 };

import { createProduct } from "./createProduct";
export { createProduct };

import { getProducts } from "./getProducts";
export { getProducts };

import { getTheProduct } from "./getTheProduct";
export { getTheProduct };

import { getFavorite } from "./getFavorite";
export { getFavorite };

import { addFavorite } from "./addFavorite";
export { addFavorite };

import { deleteFavorite } from "./deleteFavorite";
export { deleteFavorite };

import { getCart } from "./getCart";
export { getCart };

import { addCart } from "./addCart";
export { addCart };

import { deleteCart } from "./deleteCart";
export { deleteCart };

import { stripePaymentSheet } from "./stripePaymentSheet";
export { stripePaymentSheet };

import { user } from "./user";
export { user };

import { transaction } from "./transaction";
export { transaction };

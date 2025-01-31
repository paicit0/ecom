// "npm run build" everytime after an update in "functions" folder first before starting the emulator
// "firebase emulators:start --only functions"
// use http://10.0.2.2:5001 for android emulator
//index.ts
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "../../../app/auth/firebaseConfig";
import dotenv from "dotenv";

dotenv.config();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (process.env.CURRENT_APP_MODE === "dev") {
  connectFirestoreEmulator(db, "10.0.2.2", 8080);
}

export { db };

import { registerUsers } from "./registerUsers";
export { registerUsers };

import { registerSellers } from "./registerSellers";
export { registerSellers };

import { uploadawsS3 } from "./uploadawsS3";
export { uploadawsS3 };

import { createProduct } from "./createProduct";
export { createProduct };

import { getProducts } from "./getProducts";
export { getProducts };

function connectFirestoreEmulator(
  db: FirebaseFirestore.Firestore,
  arg1: string,
  arg2: number
) {
  throw new Error("Function not implemented.");
}
// import { updateUser } from "./updateUser";
// export { updateUser };

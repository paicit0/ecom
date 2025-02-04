// "npm run build" everytime after an update in "functions" folder first before starting the emulator
// firebase emulators:start --import=./firebase-export --export-on-exit=./firebase-export
// use http://10.0.2.2:5001 for android emulator
// index.ts

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "../../../app/auth/firebaseConfig";
import dotenv from "dotenv";

dotenv.config();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

import { getTheProduct } from "./getTheProduct";
export { getTheProduct };

import { updateCart } from "./updateCart";
export { updateCart };

import { updateFavorite } from "./updateFavorite";
export { updateFavorite };

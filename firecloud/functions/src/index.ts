// "npm run build" everytime after an update in "functions" folder first before starting the emulator
// "firebase emulators:start --only functions"
// use http://10.0.2.2:5001 for android emulator

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "../../firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

import { registerUsers } from "./registerUsers";
export { registerUsers };

import { securedToken } from "./securedToken";
export { securedToken };

import { loginUsers } from "./loginUsers";
export { loginUsers };

import { registerSellers } from "./registerSellers";
export { registerSellers };

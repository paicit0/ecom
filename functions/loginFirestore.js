import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const loginFirestore = async (username, password) => {
    const user = await db.collection(db, "users").doc(username);
    try {
        if (username === "admin" && password === "admin") {
            console.log("Admin logged in");
            return;
        }

    } catch (error) {
        console.error("Error logging in: ", error);
    }
};
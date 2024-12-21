import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const loginFirestore = (username, password) => {
    try {
        if (username === "admin" && password === "admin") {
            console.log("Admin logged in");
            return;
        }

    } catch (error) {
        console.error("Error logging in: ", error);
    }


};
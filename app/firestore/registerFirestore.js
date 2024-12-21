import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const registerFirestore = async (username, password) => {
    const userRef = db.collection(users).doc(username);
    const getUser = await userRef.get(username)

    if (getUser.exists) {
        console.log("User already exists");
        return;
    }

    try {
        const docRef = addDoc(collection(db, "users"), {
            username: username,
            password: password
        });
        console.log("User registered with ID: ", docRef.id);
    } catch (error) {
        console.error("Error registering user: ", error);
    }
}
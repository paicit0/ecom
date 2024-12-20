import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
export const addData = async (cart) => {
  try {
    const docRef = await addDoc(collection(db, "cart"), {
      name: cart.name,
      id: cart.id,
      sprite: cart.sprite
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

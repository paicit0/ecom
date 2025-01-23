import { useEffect } from "react";
import { Text } from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import { useFavorite } from "./store/store";

function FavoriteScreen() {
  const userFavorite = useFavorite((state) => state.favoriteItems);
  const userEmail = useUserSession((state) => state.userInfo.email);
  useEffect(() => {
    const updateFavorite = async () => {
      try {
        const updateUserUrlLocal = "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/updateUser";
        const update = await fetch(updateUserUrlLocal, {
          body: JSON.stringify({
            email: userEmail,
            favorite: userFavorite,
          }),
        });
        console.log(update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
  }, [userFavorite]);
  return (
    <>
      {userFavorite?.map(() => (
        <Text>{}</Text>
      ))}
      <Text>FavoriteScreen</Text>
    </>
  );
}

export default FavoriteScreen;

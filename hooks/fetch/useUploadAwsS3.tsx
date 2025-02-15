import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";

type fetchUploadAwsS3Type = {
  imageBase64Array: [];
  contentType: string;
};

const fetchUploadAwsS3 = async ({
  imageBase64Array,
  contentType,
}: fetchUploadAwsS3Type): Promise<string[]> => {
  if (!imageBase64Array || !contentType)
    throw new Error("imageBase64Array/contentType is required");

  const idToken = await SecureStore.getItemAsync("authToken");
  const uploadAwsS3Url =
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
      ? process.env.EXPO_PUBLIC_uploadAwsS3_emulator
      : process.env.EXPO_PUBLIC_uploadAwsS3_prod;

  if (!uploadAwsS3Url) {
    console.log("useUploadAwsS3: uploadAwsS3Url url not bussing!");
    throw new Error("API URL not found");
  }

  try {
    const { data } = await axios.post(
      uploadAwsS3Url,
      { imageBase64: imageBase64Array, contentType: contentType },
      {
        headers: {
          authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.error("useUploadAwsS3 error: ", error);
    throw error;
  }
};

export const useUploadAwsS3 = () => {
  return useMutation({
    mutationFn: ({ imageBase64Array, contentType }: fetchUploadAwsS3Type) =>
      fetchUploadAwsS3({ imageBase64Array, contentType }),
  });
};

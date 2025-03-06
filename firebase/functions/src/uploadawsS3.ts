// uploadAwsS3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import verifyBearerAndIdtoken from "./middlewares/verifyBearerAndIdtoken";

const app = express();

app.use(verifyBearerAndIdtoken);

app.post("/", async (req, res) => {
  const REGION = process.env.AWS_REGION;
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
  const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY || "",
      secretAccessKey: SECRET_KEY || "",
    },
  });

  const uploadToS3 = async (
    buffer: Buffer,
    key: string,
    contentType: string
  ) => {
    console.log("uploadAwsS3.ts.uploadToS3");
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await s3Client.send(command);
      const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
      return url;
    } catch (error) {
      console.log("uploadToS3 error", error);
      return;
      // return res
      //   .status(400)
      //   .json({ error: "uploadAwsS3: uploadToS3 error: " + error });
    }
  };

  const createThumbnail = async (imageBuffer: Buffer) => {
    console.log("uploadAwsS3.createThumbnail");
    try {
      return await sharp(imageBuffer).resize({ width: 150 }).toBuffer();
    } catch (error) {
      console.error("Sharp error:", error);
      return;
      // return res
      //   .status(400)
      //   .json({ error: "uploadAwsS3: failed to create the thumbnail" });
    }
  };
  console.log("uploadAwsS3.uploadAwsS3 function reached");
  try {
    const uniqueName = uuidv4();
    const { imageBase64, contentType } = req.body;

    if (!Array.isArray(imageBase64)) {
      return res
        .status(400)
        .json({ error: "uploadAwsS3: imageBase64 must be an array" });
    }

    const validContentTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validContentTypes.includes(contentType)) {
      return res
        .status(400)
        .json({ error: "uploadAwsS3: Invalid content type" });
    }

    const resImageUrlArray: string[] = [];
    const resThumbnailUrlArray: string[] = [];

    for (let i = 0; i < imageBase64.length; i++) {
      // console.log("imageBase64[i]", imageBase64[i]);
      const imageBuffer = Buffer.from(imageBase64[i], "base64");
      // console.log("imageBuffer", imageBuffer);
      const thumbnailBuffer = await createThumbnail(imageBuffer);

      const originalKey = `uploads/${uniqueName}-${i}`;
      const thumbnailKey = `thumbnails/${uniqueName}-${i}`;

      if (!imageBuffer || !thumbnailBuffer) {
        return res
          .status(400)
          .json({ error: "uploadAwsS3: no imageBuffer/thumbnailBuffer" });
      }

      const [imageUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(imageBuffer, originalKey, contentType),
        uploadToS3(thumbnailBuffer, thumbnailKey, contentType),
      ]);

      if (imageUrl && thumbnailUrl) {
        resImageUrlArray.push(imageUrl);
        resThumbnailUrlArray.push(thumbnailUrl);
      }
    }
    console.log("Urls Array", resImageUrlArray, resThumbnailUrlArray);
    return res.status(201).json({ resImageUrlArray, resThumbnailUrlArray });
  } catch (error) {
    console.error("uploadAwsS3: Error generating upload URL:", error);
    return res
      .status(500)
      .json({ error: "uploadAwsS3: Internal server error" });
  }
});

export const uploadAwsS3 = functions.https.onRequest(app);

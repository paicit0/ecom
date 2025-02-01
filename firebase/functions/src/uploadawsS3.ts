// uploadawsS3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import * as admin from "firebase-admin";
require("firebase-functions/logger/compat"); // enables console.log()

console.log("uploadawsS3 reached");

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

const uploadToS3 = async (buffer: Buffer, key: string, contentType: string) => {
  console.log("uploadawsS3.ts.uploadToS3");
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
  }
};

const createThumbnail = async (imageBuffer: Buffer) => {
  console.log("uploadawsS3.ts.createThumbnail");
  try {
    return await sharp(imageBuffer).resize({ width: 150 }).toBuffer();
  } catch (error) {
    console.error("Sharp error:", error);
    throw new Error("Failed to create thumbnail.");
  }
};

const uploadawsS3 = functions.https.onRequest(async (req, res) => {
  console.log("uploadawsS3.ts.uploadawsS3");
  try {
    const uniqueName = uuidv4();
    const { imageBase64, contentType } = req.body;
    const authHeader = req.headers.authorization;
    console.log("uploadawsS3.ts req.body", req.body);
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }
    const idToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        res.status(401).json("No auth token.");
        return;
      }
    } catch (error) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }

    if (!Array.isArray(imageBase64)) {
      res.status(400).json({ error: "imageBase64 must be an array" });
      return;
    }

    const validContentTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validContentTypes.includes(contentType)) {
      res.status(400).json({ error: "Invalid content type" });
      return;
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

      const [imageUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(imageBuffer, originalKey, contentType),
        uploadToS3(thumbnailBuffer, thumbnailKey, contentType),
      ]);

      if (imageUrl && thumbnailUrl) {
        resImageUrlArray.push(imageUrl);
        resThumbnailUrlArray.push(thumbnailUrl);
      }
    }
    console.log("imageUrlArray", resImageUrlArray);
    console.log("thumbnailUrlArray", resThumbnailUrlArray);
    res.status(200).json({ resImageUrlArray, resThumbnailUrlArray });
    return;
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { uploadawsS3 };

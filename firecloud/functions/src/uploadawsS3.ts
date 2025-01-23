// uploadawsS3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";

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
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  return url;
};

const createThumbnail = async (imageBuffer: Buffer) => {
  return sharp(imageBuffer).resize({ width: 250 }).toBuffer();
};

const uploadawsS3 = functions.https.onRequest(async (req, res) => {
  try {
    const uniqueName = uuidv4();
    const { imageBase64, contentType } = await req.body;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const thumbnailBuffer = await createThumbnail(imageBuffer);

    const originalKey = `uploads/${uniqueName}`;
    const thumbnailKey = `thumbnails/${uniqueName}`;

    const [imageUrl, thumbnailUrl] = await Promise.all([
      uploadToS3(imageBuffer, originalKey, contentType),
      uploadToS3(thumbnailBuffer, thumbnailKey, contentType),
    ]);

    res.status(200).json({ imageUrl, thumbnailUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: error });
  }
});

export { uploadawsS3 };

import { v4 as uuidv4 } from "uuid";
import * as functions from "firebase-functions";
import { db } from "./index";
import { Timestamp } from "firebase-admin/firestore";
// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "ap-southeast-2" });

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const fileName = uuidv4();

const awsS3 = functions.https.onRequest(async (req, res) => {
  const { file } = req.body;
  const upload = s3.upload;
});

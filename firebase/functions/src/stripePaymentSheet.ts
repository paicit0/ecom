// stripePaymentSheet/payment-sheet.ts
import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Stripe from "stripe";
import { db } from "./index";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/payment-sheet", async (req, res) => {
  try {
    const { amount, userEmail, customerName, customerCity, customerId } =
      req.body;
    console.log("stripePaymentSheet/payment-sheet: req.body", req.body);

    let customerIdStripe;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        shipping: {
          name: customerName,
          address: { city: customerCity },
        },
      });
      customerIdStripe = customer.id;
      console.log(
        "stripePaymentSheet/payment-sheet: new customer",
        customer.id
      );
    } else {
      const getCustomer = await stripe.customers.retrieve(customerId);
      console.log(
        "stripePaymentSheet/payment-sheet: get customer id",
        getCustomer.id
      );
      if (getCustomer) {
        customerIdStripe = getCustomer.id;
      } else {
        console.error("stripePaymentSheet/payment-sheet: error");
        return res.status(500).json({
          error: "stripePaymentSheet/payment-sheet: failed to get customer",
        });
      }
    }

    const userSnapshot = await db
      .collection("users")
      .where("userEmail", "==", userEmail)
      .get();
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data() || {};
      if (!userData.customerIdStripe) {
        await userDoc.ref.update({ customerIdStripe: customerIdStripe });
      }
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerIdStripe },
      { apiVersion: "2024-12-18.acacia" }
    );
    console.log(
      "stripePaymentSheet/payment-sheet: ephemeralKey.id",
      ephemeralKey.id
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "thb",
      customer: customerIdStripe,
      automatic_payment_methods: { enabled: true },
    });
    console.log(
      "stripePaymentSheet/payment-sheet: paymentIntent.id",
      paymentIntent.id
    );

    return res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerIdStripe,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("stripePaymentSheet/payment-sheet: Error", error);
    return res.status(500).json({ error: error });
  }
});

export const stripePaymentSheet = functions.https.onRequest(app);

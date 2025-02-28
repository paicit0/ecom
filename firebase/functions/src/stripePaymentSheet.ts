// stripePaymentSheet.ts
import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

const app = express();
app.use(cors({ origin: true }));

app.post("/payment-sheet", async (req, res) => {
  try {
    const { amount, userEmail } = req.body;
    console.log("stripePaymentSheet: req.body", req.body);
    const customer = await stripe.customers.create({ email: userEmail });
    console.log("stripePaymentSheet: customer", customer);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-12-18.acacia" }
    );
    console.log("stripePaymentSheet: ephemeralKey", ephemeralKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "thb",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
    console.log("stripePaymentSheet: paymentIntent", paymentIntent);

    res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("stripePaymentSheet: Error", error);
    res.status(500).json({ error: error });
  }
});

export const stripePaymentSheet = functions.https.onRequest(app);

const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;

// require library for stripe pay
const { resolve } = require('path');
require('dotenv').config({ path: './.env.payment' });
// Ensure environment variables are set.
checkEnv();

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51IlV2dAfgcpVdQrP0R4Vddmpe6vEdgBjWKkbOvuWcPYbIpHKWnlekzQRuJhFtQ4wkr786DLDQ1jvPQo7fkzfGI7u00O9xQi7zI');

const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = params => {
  const { client } = params;

  router.get("/", async (req, res, next) => {

    let cardId = req.query.id;

    try {
      let cardData = await client.db("reckoning").collection("cards").find({ _id: ObjectId(cardId)}).toArray();

      return res.render('layout', {
        template: 'cardDetails',
        cardData
      })

    } catch (err) {
      console.log("Error on dashboard enpoint", err);
      return next(err);
    }

  });

  router.get('/config', async (req, res) => {

    const price = await stripe.prices.retrieve("price_1IpOj4AfgcpVdQrPBBDv8CIh");

    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      unitAmount: price.unit_amount,
      currency: price.currency,
    });
  });

  // Fetch the Checkout Session to display the JSON result on the success page
  router.get('/checkout-session', async (req, res) => {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
  });

  router.post('/create-checkout-session', async (req, res) => {
    const domainURL = process.env.DOMAIN;

    const { quantity, locale } = req.body;

    // The list of supported payment method types. We fetch this from the
    // environment variables in this sample. In practice, users often hard code a
    // list of strings for the payment method types they plan to support.
    const pmTypes = (process.env.PAYMENT_METHOD_TYPES || 'card').split(',').map((m) => m.trim());

    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [customer_email] - lets you prefill the email input in the Checkout page
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    const session = await stripe.checkout.sessions.create({
      payment_method_types: pmTypes,
      mode: 'payment',
      locale: locale,
      line_items: [
        {
          price: process.env.PRICE,
          quantity: quantity
        },
      ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/paymentSuccess.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/canceled.html`,
    });

    res.send({
      sessionId: session.id,
    });
  });

// Webhook handler for asynchronous events.
  router.post('/webhook', async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers['stripe-signature'];

      try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }

    if (eventType === 'checkout.session.completed') {
      console.log(`🔔  Payment received!`);
    }

    res.sendStatus(200);
  });


  router.post("/updateBalance", async (req, res, next) => {

    let cardData = req.body;
    let cardId = cardData.cardId,
        balance = parseInt(cardData.balance);
    //console.log(typeof balance);
    try {
      const card = await client.db("reckoning").collection("cards").updateOne({ _id: ObjectId(cardId)},{
        $inc: { balance: balance },
      });
      console.log(card);
      return res.status(200).send("success")

    } catch (err) {
      console.log("Error when create new area", err);
      return next(err);
    }
  });

  return router;
};

function checkEnv() {
  const price = process.env.PRICE;
  console.log(process.env)
  if(price === "price_12345" || !price) {
    console.log("You must set a Price ID in the environment variables. Please see the README.");
    process.exit(0);
  }
}
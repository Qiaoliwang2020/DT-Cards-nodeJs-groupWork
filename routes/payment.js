const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;

const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// require library for stripe pay
const { resolve } = require('path');
const env = require('dotenv').config({ path: './.env.payment' });
// Ensure environment variables are set.
checkEnv();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let calculateOrderAmount = (item)=>{
    return item.price * 100
};
module.exports = params => {
    const {client} = params;

    router.get("/", async (req, res, next) => {

        let cardId = req.query.id,amount = req.query.amount;

        try {
            let cardData = await client.db("reckoning").collection("cards").find({ _id: ObjectId(cardId)}).toArray();
            cardData.price =  amount
            return res.render('layout', {
                template: 'paymentConfirm',
                cardData
            })

        } catch (err) {
            console.log("Error on dashboard enpoint", err);
            return next(err);
        }

    });
   // for stripe pay
    router.get("/public-key", (req, res) => {
        res.send({publicKey: process.env.STRIPE_PUBLISHABLE_KEY});
    });

    router.post("/payment_intents", async (req, res) => {
        let { currency, items } = req.body;
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: calculateOrderAmount(items),
                currency
            });
            return res.status(200).json(paymentIntent);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });

    router.get("/payment_intent_succeeded", (req, res) => {
        const path = resolve(`/paymentSuccess.html/payment_succeeded.html`);
        res.sendFile(path);
    });

   // Webhook handler for asynchronous events.
    router.post("/webhook", async (req, res) => {
        // Check if webhook signing is configured.
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            // Retrieve the event by verifying the signature using the raw body and secret.
            let event;
            let signature = req.headers["stripe-signature"];
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
            data = event.data;
            eventType = event.type;
        } else {
            // Webhook signing is recommended, but if the secret is not configured in `config.js`,
            // we can retrieve the event data directly from the request body.
            data = req.body.data;
            eventType = req.body.type;
        }

        if (eventType === "payment_intent.succeeded") {
            console.log("💰Your user provided payment details!");
            // Fulfill any orders or e-mail receipts
            res.sendStatus(200);
        }
    });
    return router;
}

function checkEnv() {
    const price = process.env.PRICE;
    console.log(process.env)
    if(price === "price_12345" || !price) {
        console.log("You must set a Price ID in the environment variables. Please see the README.");
        process.exit(0);
    }
}
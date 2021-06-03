const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;

const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


module.exports = params => {
    const { client } = params;

    router.get("/", async (req, res, next) => {

        let cardId = req.query.cardId;

        try {
            let cardData = await client.db("reckoning").collection("cards").find({ _id: ObjectId(cardId)}).toArray();

            return res.render('layout', {
                template: 'rateAndReviewDetails',
                cardData
            })

        } catch (err) {
            console.log("Error on card detail enpoint", err);
            return next(err);
        }

    });
    router.post("/addReview", async (req, res, next) => {

        let review = req.body;
        review.createTime = Date.now();
        try {
            const reviews = await client.db("reckoning").collection("reviews").insertOne(review);
            return res.status(200).send("success")

        } catch (err) {
            console.log("Error when update card Balance", err);
            return next(err);
        }
    })
    router.post("/addRate", async (req, res, next) => {

        let rate = req.body;

        try {
            const rates = await client.db("reckoning").collection("rates").insertOne(rate);
            return res.status(200).send("success")

        } catch (err) {
            console.log("Error when update card Balance", err);
            return next(err);
        }
    });
    router.get("/reviews", async (req, res, next) => {

        let {city} = req.query;

        try {
            let reviews = await client.db("reckoning").collection("reviews").find({city:city}).toArray();

            return res.json(reviews);

        } catch (err) {
            console.log("Error on card detail enpoint", err);
            return next(err);
        }

    });

    return router;
};



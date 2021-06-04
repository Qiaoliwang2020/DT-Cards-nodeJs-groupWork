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
    /**
     *  user get card details (city)
     *  qiaoli wang (wangqiao@deakin.edu.au)
     */
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
    /**
     *  add a review
     * qiaoli wang (wangqiao@deakin.edu.au)
     */
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
    /**
     *  get all reviews by city
     *  qiaoli wang (wangqiao@deakin.edu.au)
     */
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
    /**
     *  add a rating
     * qiaoli wang (wangqiao@deakin.edu.au)
     */
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
    /**
     *  get average rate by city
     *  qiaoli wang (wangqiao@deakin.edu.au)
     */
    router.get("/averageRate", async (req, res, next) => {

        let {city} = req.query;
        try {
            let rate = await client.db("reckoning").collection("rates").find({city:city}).toArray();
            let averageRate = {city:'',rating:0},totalRating = 0;

            if(rate.length > 1){
               rate.forEach((item)=>{
                   let rating = parseFloat(item.rating);
                   averageRate._id = item._id;
                   totalRating += rating;
                   averageRate.rating = (totalRating/rate.length).toFixed(1).toString();
                   averageRate.city = item.city;
               })
            return res.status(200).send(averageRate)

            }else if(rate.length === 0){
                return res.status(200).send({city:city,rating:"0.0"});
            }
            else{
                return res.status(200).send(rate[0]);
            }
        } catch (err) {
            console.log("Error on card detail enpoint", err);
            return next(err);
        }

    });
    return router;
};



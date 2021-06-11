const express = require("express");
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require("body-parser");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;

const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = (params) => {
  const { client } = params;
  /**
   *  user get card details (city)
   *  qiaoli wang (wangqiao@deakin.edu.au)
   */
  router.get("/", async (req, res, next) => {
    let cardId = req.query.cardId;

    try {
      let cardData = await client
        .db("reckoning")
        .collection("cards")
        .find({ _id: ObjectId(cardId) })
        .toArray();

      return res.render("layout", {
        template: "rateAndReviewDetails",
        cardData,
      });
    } catch (err) {
      console.log("Error on rate and review get card details  enpoint", err);
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
      const reviews = await client
        .db("reckoning")
        .collection("reviews")
        .insertOne(review);
      return res.status(200).send("success");
    } catch (err) {
      console.log("Error add a review", err);
      return next(err);
    }
  });
  /**
   * add a reply
   * qiaoli wang (wangqiao@deakin.edu.au)
   */
  router.post("/addReply", async (req, res, next) => {
    let reply = req.body;
    reply.createTime = Date.now();
    try {
      const replies = await client
        .db("reckoning")
        .collection("replies")
        .insertOne(reply);
      return res.status(200).send({ status: 200, data: replies.ops[0] });
    } catch (err) {
      console.log("Error add a reply", err);
      return next(err);
    }
  });
  /**
   * get replies by review id
   * qiaoli wang (wangqiao@deakin.edu.au)
   */
  router.get("/replies", async (req, res, next) => {
    let { reviewId } = req.query;

    try {
      let replies = await client
        .db("reckoning")
        .collection("replies")
        .find({ reviewId: reviewId })
        .sort({ createTime: -1 })
        .toArray();

      return res.status(200).send({ status: 200, data: replies });
    } catch (err) {
      console.log("Error on get replies endpoint", err);
      return next(err);
    }
  });
  /**
   *  get all reviews by city
   *  qiaoli wang (wangqiao@deakin.edu.au)
   */
  router.get("/reviews", async (req, res, next) => {
    let { city } = req.query;

    try {
      let reviews = await client
        .db("reckoning")
        .collection("reviews")
        .find({ city: city })
        .sort({ createTime: -1 })
        .toArray();

      return res.json(reviews);
    } catch (err) {
      console.log("Error on card detail endpoint", err);
      return next(err);
    }
  });

  router.get("/reviewsSearch", async (req, res, next) => {
    let { city, text } = req.query;

    try {
      let reviews = await client
        .db("reckoning")
        .collection("reviews")
        .find({ city: city, review: { $regex: `.*${text}.*` } })
        .toArray();
      return res.json(reviews);
    } catch (err) {
      console.log("Error on card detail endpoint", err);
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
      const rates = await client
        .db("reckoning")
        .collection("rates")
        .insertOne(rate);
      return res.status(200).send("success");
    } catch (err) {
      console.log("Error when add a rating", err);
      return next(err);
    }
  });
  /**
   *  get average rate by city
   *  qiaoli wang (wangqiao@deakin.edu.au)
   */
  router.get("/averageRate", async (req, res, next) => {
    let { city } = req.query;
    try {
      let rate = await client
        .db("reckoning")
        .collection("rates")
        .find({ city: city })
        .toArray();
      let averageRate = { city: "", rating: 0 },
        totalRating = 0;

      if (rate.length > 1) {
        rate.forEach((item) => {
          let rating = parseFloat(item.rating);
          averageRate._id = item._id;
          totalRating += rating;
          averageRate.rating = (totalRating / rate.length)
            .toFixed(1)
            .toString();
          averageRate.city = item.city;
        });
        return res.status(200).send(averageRate);
      } else if (rate.length === 0) {
        return res.status(200).send({ city: city, rating: "0.0" });
      } else {
        return res.status(200).send(rate[0]);
      }
    } catch (err) {
      console.log("Error on get average rate by city endpoint", err);
      return next(err);
    }
  });

  router.get("/deleteReview", async (req, res, next) => {
    let { reviewId } = req.query;
    try {
      const reviews = await client
        .db("reckoning")
        .collection("reviews")
        .deleteOne({ _id: ObjectId(reviewId) }, function (err, reviews) {
          if (err) throw err;
          console.log(`Deleted ${reviews.deletedCount} item.`);
          console.log({ reviewId });
          res.send(reviews).status(200);
        });
      // res.send("success").status(200);
    } catch (err) {
      console.log("Error add a review", err);
      return next(err);
    }
  });

  router.post("/editReview", async (req, res, next) => {
    let { reviewId, review } = req.body;
    try {
      const reviews = await client
        .db("reckoning")
        .collection("reviews")
        .updateOne({ _id: ObjectId(reviewId) }, { $set: { review } });
      return res.status(200).send("success");
    } catch (err) {
      console.log("Error add a review", err);
      return next(err);
    }
  });

  return router;
};

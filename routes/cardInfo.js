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

    let cardId = req.query.id;

    try {
      let cardData = await client.db("reckoning").collection("cards").find({ _id: ObjectId(cardId)}).toArray();
      console.log(cardData)
      return res.render('layout', {
        template: 'cardDetails',
        cardData
      })

    } catch (err) {
      console.log("Error on dashboard enpoint", err);
      return next(err);
    }

  });
  return router;
};
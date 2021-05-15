const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;
const convertCurrency = require('./convertCurrency')

const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const defaultCurrency = 'AUD';

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
      console.log("Error on card detail enpoint", err);
      return next(err);
    }

  });
  router.post("/updateBalance", async (req, res, next) => {

    let cardData = req.body;
    let cardId = cardData.cardId,
        payId = cardData.payId,
        currency = cardData.currency.toUpperCase(),
        balance = parseFloat(cardData.balance);

    try {
      convertCurrency(balance, currency, defaultCurrency, function(err, amount) {
        const card =  client.db("reckoning").collection("cards").updateOne({ _id: ObjectId(cardId)},{
          $inc: { balance: amount },
          $set: { payId: payId }
        });
        return res.status(200).send("success")
      });
    } catch (err) {
      console.log("Error when update card Balance", err);
      return next(err);
    }

  });

  return router;
};



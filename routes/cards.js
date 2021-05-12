const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;
const cc = require('currency-codes');


const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = params => {
  const { client } = params;
  router.get("/", async (req, res, next) => {
    let userId = req.query.userId;
    try {
      let cardsData = await client.db("reckoning").collection("cards").find({userId: userId}).toArray();

      return  res.json(cardsData);

    } catch (err) {
      console.log("Error on cards enpoint", err);
      return next(err);
    }

  });
  router.post("/createCard", async (req, res, next) => {
    let cardData = req.body;

    let color = generateDarkColorHex();
    let country = cardData.country;
    let currency = getCurrency(country);

    cardData.balance = 0,
    cardData.createTime = moment().format('L');
    cardData.expire = moment().add(1, 'years').calendar();
    cardData.cardBackground = color;
    cardData.currency = currency;

    try {

      const card = await client.db("reckoning").collection("cards").insertOne(cardData);

      return res.status(200).send({message:"success"})

    } catch (err) {
      console.log("Error when create new card", err);
      return next(err);
    }
  })
  router.post("/deleteCard", async (req, res, next) => {

    let {cardId} = req.body;

    //console.log(typeof balance);
    try {
      const card = await client.db("reckoning").collection("cards").deleteOne( { "_id" : ObjectId(cardId) } )
      // console.log(card);
      return res.status(200).send("success")

    } catch (err) {
      console.log("Error when update card Balance", err);
      return next(err);
    }
  })

  function generateDarkColorHex() {
    let color = "#";
    for (let i = 0; i < 3; i++)
      color += ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2);
    return color;
  }
  function getCurrency(country){
    let currencies = cc.country(country);
    return currencies.map(elem => (
        {
          currency: elem.currency,
          code: elem.code
        }
    ));
  }

  return router;
};
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

    try {

      let cardsData = await client.db("reckoning").collection("cards").find({}).toArray();

      cardsData.forEach(entry => {
        // if (entry.timeStamp) {
        //   const convertedTimeStamp = moment.unix(entry.timeStamp);
        //   entry.timeStamp = moment(convertedTimeStamp).fromNow();
        // }
        console.log(cardsData,'entry');
      })

      // return res.render('layout', {
      //   template: 'cardDetails',
      //   cardsData
      // })
      return  res.json(cardsData);

    } catch (err) {
      console.log("Error on dashboard enpoint", err);
      return next(err);
    }

  });
  router.post("/createCard", async (req, res, next) => {

    let cardData = req.body;
    let color = generateDarkColorHex();
    cardData.balance = 0,
    cardData.createTime = moment().format('L');
    cardData.expire = moment().add(1, 'years').calendar();
    cardData.cardBackground = color;
    try {

      const card = await client.db("reckoning").collection("cards").insertOne(cardData);

      return res.status(200).send("success")

    } catch (err) {
      console.log("Error when create new area", err);
      return next(err);
    }
  })
  function generateDarkColorHex() {
    let color = "#";
    for (let i = 0; i < 3; i++)
      color += ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2);
    return color;
  }
  return router;
};
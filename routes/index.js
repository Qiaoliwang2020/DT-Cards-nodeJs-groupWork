const express = require("express");
const router = express.Router();

const cardRoute = require("./cardInfo");
const cardsRoute = require("./cards");
const travelRoute = require("./travelHistory");
const transacsRoute = require("./transactionList");
const transacDetailRoute = require("./transactionDetails");
const paymentRoute = require("./payment");
const rateAndReviewDetailsRoute = require("./rateAndReviewDetails");
const travelDetailsRoute = require("./travelDetails");
const rankingCities = require("./rankingCity");

module.exports = (params) => {
  router.use("/card", cardRoute(params));
  router.use("/cards", cardsRoute(params));
  router.use("/travelData", travelRoute(params));
  router.use("/transacData", transacsRoute(params));
  router.use("/transacDetailData", transacDetailRoute(params));
  router.use("/payment", paymentRoute(params));
  router.use("/rateAndReview", rateAndReviewDetailsRoute(params));
  router.use("/travelDetailsData", travelDetailsRoute(params));
  router.use("/rankingCityData", rankingCities(params));
  return router;
};

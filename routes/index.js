const express = require("express");
const router = express.Router();

const cardRoute = require("./cardInfo");
const cardsRoute = require("./cards");
const travelRoute = require("./travelHistory");
const transacsRoute = require("./transactionList");
const transacDetailRoute = require("./transactionDetails");
// const cardRoute = require("./cardInfo");
// const cardsRoute = require("./cards");
const paymentRoute = require("./payment");

module.exports = (params) => {
  router.use("/card", cardRoute(params));
  router.use("/cards", cardsRoute(params));
  router.use("/travelData", travelRoute(params));
  router.use("/transacData", transacsRoute(params));
  router.use("/transacDetailData", transacDetailRoute(params));
  // router.use("/card", cardRoute(params));
  // router.use("/cards", cardsRoute(params));
  router.use("/payment", paymentRoute(params));

  return router;
};

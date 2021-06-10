const express = require("express");
const bodyParser = require("body-parser");
const { relativeTimeRounding } = require("moment");

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = (params) => {
  const { client } = params;

  router.get("/", async (req, res, next) => {
    try {
      let rankingCityData = await client
        .db("reckoning")
        .collection("rates")
        .find()
        .toArray();

      return res.render("layout", {
        template: "rankingCity",
        rankingCityData,
      });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });
  router.get("/allCities", async (req, res, next) => {
    try {
      let rankingCityData = await client
        .db("reckoning")
        .collection("rates")
        .find()
        .toArray();

      return res.status(200).send({ data: rankingCityData });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });

  // router.get("/rateAndReview/averageRate", async (req, res, next) => {
  //   try {
  //     let averageRates = req.params;
  //     console.log(averageRates);
  //     return res.render("layout", {
  //       template: "rankingCity",
  //       averageRates,
  //     });
  //   } catch (err) {
  //     console.log("Error in endpoint", err);
  //     return next(err);
  //   }
  // });

  return router;
};

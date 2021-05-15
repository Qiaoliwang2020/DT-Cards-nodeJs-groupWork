const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = (params) => {
  const { client } = params;

  // Get data from Database
  router.get("/", async (req, res, next) => {
    try {
      let transacData = await client
        .db("reckoning")
        .collection("payments")
        .find()
        .toArray();

      const formattedDate = moment(transacData.created).format("DD/MM/YY");

      // Display data in View
      return res.render("layout", {
        template: "transactionList",
        transacData,
        formattedDate,
      });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });

  return router;
};

const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

module.exports = (params) => {
  const { client } = params;

  // Get data from Database
  router.get("/", async (req, res, next) => {
    // Requesting Transaction ID
    let transationId = req.query.transationId;
    try {
      let transacDetailData = await client
        .db("reckoning")
        .collection("transactions")
        .find({ _id: ObjectId(transationId) })
        .toArray();

      const formattedDate = moment(transacDetailData.created).format(
        "DD/MM/YY"
      );
      // Display data in View
      return res.render("layout", {
        template: "transactionDetails",
        transacDetailData,
        formattedDate,
      });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });
  return router;
};

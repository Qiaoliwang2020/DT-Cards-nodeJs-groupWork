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
    let travelId = req.query.travelId;
    try {
      let travelDetailsData = await client
        .db("reckoning")
        .collection("transactions")
        .find({ _id: ObjectId(travelId) })
        .toArray();

      const formattedDate = moment(travelDetailsData.created).format(
        "DD/MM/YY"
      );
      // Display data in View
      return res.render("layout", {
        template: "travelDetails",
        travelDetailsData,
        formattedDate,
      });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });
  return router;
};

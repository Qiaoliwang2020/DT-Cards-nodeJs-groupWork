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
    // let userId = req.query.userId;
    try {
      let travelData = await client
        .db("reckoning")
        .collection("transactions")
        .find()
        .toArray();

      const formattedDate = moment(travelData.created).format("DD/MM/YY");
      // Display data in View
      return res.render("layout", {
        template: "travelHistory",
        travelData,
        formattedDate,
      });
    } catch (err) {
      console.log("Error in endpoint", err);
      return next(err);
    }
  });
  return router;
};

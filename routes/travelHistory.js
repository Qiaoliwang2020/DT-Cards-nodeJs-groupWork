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
  /**
   *  insert travel history to database
   *  Qiaoli Wang
   *  wangqiao@deakin.edu.au
   */
  router.post("/addTransaction", async (req, res, next) => {
    let data = req.body;

    try {
      const transaction = await client.db("reckoning").collection("transactions").insertOne(data);

      return res.status(200).send({message:"success"})

    } catch (err) {
      console.log("Error add new transaction", err);
      return next(err);
    }
  })
  /**
   *  get travels by user id
   *  Qiaoli Wang
   *  wangqiao@deakin.edu.au
   */
  router.get("/travels", async (req, res, next) => {
    let userId = req.query.userId;
    try {
      let travelsData = await client.db("reckoning").collection("transactions").find({userId: userId}).toArray();

      return  res.json(travelsData);

    } catch (err) {
      console.log("Error on get travels endpoint", err);
      return next(err);
    }

  });

  return router;
};

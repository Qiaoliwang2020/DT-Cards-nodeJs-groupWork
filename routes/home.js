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
      //await client.connect();

      let greenhouseData = await client.db("greenhouse").collection("areas").find({}).toArray();

      greenhouseData.forEach(entry => {
        if (entry.timeStamp) {
          const convertedTimeStamp = moment.unix(entry.timeStamp);
          entry.timeStamp = moment(convertedTimeStamp).fromNow();
        }
      })

      return res.render('layout', {
        template: 'home',
        greenhouseData
      })

    } catch (err) {
      console.log("Error on dashboard enpoint", err);
      return next(err);
    }

  });

  const updateArea = async (podID, insectsAmount, timeStamp) => {
    console.log(`ObjectId("${podID}")`)
    if (podID && insectsAmount && timeStamp) {
      let result = await client.db("greenhouse").collection("areas").updateOne({ _id: ObjectId(podID.toString()) }, {
        $set: { insectsAmount, timeStamp }
      })
      //console.log("Update area test", result);
      return result.modifiedCount;
    }
    return null;
  }

  router.post("/", async (req, res, next) => {
    const { _id, insectsAmount, timeStamp } = req.body;

    // console.log("Record endpoint check", areaID, insectsAmount, timeStamp)

    try {
      //await client.connect();

      if (!_id || !insectsAmount || !timeStamp) {
        return res.status(500).send("Failed")
      }

      // Insert the new update in the general collection
      let generalRecord = await client.db("greenhouse").collection("general").insertOne({ podID:_id, insectsAmount, timeStamp });

      // Update the relevant area with the new input
      let areaUpdated = await updateArea(_id, insectsAmount, timeStamp);

      console.log("Record endpoint check", areaUpdated)

      if (!generalRecord.insertedCount || !areaUpdated) {
        return res.status(500).send("fail")
      }

      return res.status(200).send("success")

    } catch (err) {
      console.log("Error on record endpoint", err);
      return next(err);
    }

  });

  router.post("/createArea", async (req, res, next) => {
    const { podName } = req.body;

    console.log(podName)

    try {
      //await client.connect()

      const areaGenerated = await client.db("greenhouse").collection("areas").insertOne({ podName, insectsAmount: 0, timeStamp: null });

      if (!areaGenerated.insertedCount) {
        return res.status(500).send("fail")
      }

      return res.status(200).send("success")

    } catch (err) {
      console.log("Error when create new area", err);
      return next(err);
    }
  })

  return router;
};
const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require ('body-parser');
const ObjectId = require('mongodb').ObjectId;


const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

module.exports = params => {
  const {client} = params;

    router.get("/pod", async(req, res,next) => {
       
        try {
          const { podID } = req.query;
          // console.log('Pod Requested dsaf', podID)
          
          let podHistory = await client.db("greenhouse").collection("general").find( {"podID" : podID.toString() }).toArray();
          console.log(podHistory)

          if (podHistory.length > 0) {
            return res.status(200).send(podHistory);
          }
          
          return res.status(404).send('History not found');

        } catch (err) {
            console.log("Error on dashboard enpoint", err);
            return next(err);
        }
      });

    return router;
};
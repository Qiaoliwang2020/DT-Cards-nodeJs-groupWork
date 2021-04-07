const express = require('express');
// const { check, validator, validationResult } = require('express-validator');
const bodyParser = require ('body-parser');


const router = express.Router();

// bodyParse setup
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

module.exports = params => {
    router.get("/", (req, res) => {
        const user_name = req.query.user_name;
        res.end("Hello " + user_name + "!");
      });

    return router;
};
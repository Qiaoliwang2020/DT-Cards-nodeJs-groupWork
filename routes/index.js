const express = require('express');
const router = express.Router();

const cardRoute = require('./cardInfo');
const cardsRoute = require('./cards');


module.exports = (params) => {
    router.use('/card',cardRoute(params));
    router.use('/cards',cardsRoute(params));
    return router;
};
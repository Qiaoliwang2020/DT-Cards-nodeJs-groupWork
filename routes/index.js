const express = require('express');
const router = express.Router();

const cardRoute = require('./cardInfo');
const cardsRoute = require('./cards');
const paymentRoute = require('./payment');


module.exports = (params) => {
    router.use('/card',cardRoute(params));
    router.use('/cards',cardsRoute(params));
    router.use('/payment',paymentRoute(params));
    return router;
};
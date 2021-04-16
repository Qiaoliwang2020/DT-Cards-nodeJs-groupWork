const express = require('express');
const router = express.Router();

const test = require('./test');
const counterRoute = require('./counter');
const dashboardRoute = require('./dashboard');
const dataRoute=require('./data');
const cardRoute = require('./cardInfo');
const cardsRoute = require('./cards');


module.exports = (params) => {
    // router.get('/', (req, res) => {
    //     res.render('layout', {
    //         template: 'home'
    //     });
    // })
    router.use('/test', test());
    router.use('/counter', counterRoute(params));
    router.use('/dashboard', dashboardRoute(params));
    router.use('/card',cardRoute(params));
    router.use('/data',dataRoute(params));
    router.use('/cards',cardsRoute(params));
    return router;
};
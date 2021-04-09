const express = require('express');
const router = express.Router();

const test = require('./test');
const counterRoute = require('./counter');
const dashboardRoute = require('./dashboard');
const dataRoute=require('./data');
const homeRoute = require('./home');



module.exports = (params) => {
    // router.get('/', (req, res) => {
    //     res.render('layout', {
    //         template: 'home'
    //     });
    // })

    router.use('/test', test());
    router.use('/counter', counterRoute(params));
    router.use('/dashboard', dashboardRoute(params));
    router.use('/home', homeRoute(params));
    router.use('/data',dataRoute(params))



    return router;
};
//import routes
const routes = require('express').Router();

const processfiles = require('./processfiles');

routes.post('/processfiles/:customer_id/:customer_variation', processfiles);

module.exports = routes;
const routes = require('express').Router();

const getcustomers = require('./getcustomers');
const getoptions = require('./getoptions');

routes.get('/getcustomers', getcustomers);
routes.get('/getoptions/:customer_id', getoptions);

module.exports = routes;
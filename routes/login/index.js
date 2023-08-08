const routes = require('express').Router();

const checkuserusingad = require('./loginusingactivedirectory');

routes.post('/checkuserusingad', checkuserusingad);

module.exports = routes;
const express = require('express');
const routes = express.Router();
const XLSX = require('xlsx');

const login = require('./login');
const masterdata = require('./masterdata');
const processdata = require('./processdata');
const authenticateToken = require('./auth/authmiddleware');
const getrefreshsessionaccess = require('./auth/getrefreshsessionaccess');

routes.use(express.json());

routes.use('/login', login);
routes.use('/getrefreshsessionaccess', getrefreshsessionaccess);

//Apply middleware authentication to all routes after this
routes.use(authenticateToken);

routes.use('/processdata', processdata);
routes.use('/masterdata', masterdata);

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'labdip chart api connected!' });
});

//handle invalid routes - **keep it at last always
routes.use((req, res) => {
  // error response for invalid routes
  res.status(404).json({ type: "ERROR", message: "invalid route" });
});

module.exports = routes;

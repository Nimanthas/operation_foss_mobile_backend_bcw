// Bring in our dependencies
const express = require("express");
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const winston = require('winston');
const fileUpload = require('express-fileupload');

const routes = require('./routes');
const Settings = require("./settings");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: 'logs/labdipchart_api_' + new Date().toISOString().slice(0, 10) + '.log' }) // Logs to a file
  ]
});

// Allow requests only from this origin
const allowedOrigins = ['https://localhost:3001', 'http://localhost:3000', 'http://localhost:8701'];
const corsOptions = {
  origin: allowedOrigins,
};

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors()); //app.use(cors(corsOptions));
app.use(fileUpload());

//Connect all our routes to our application
app.use('/', routes);


// Turn on that server!
const PORT = Settings.port || 5001;
app.listen(PORT, () => {
  logger.info(`lab dip chart api started successfully on port ${PORT}`);
});
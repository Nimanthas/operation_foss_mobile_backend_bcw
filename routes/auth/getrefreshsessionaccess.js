const jwt = require('jsonwebtoken');
const settings = require("../../settings");

// Import the secret key from the 'secretkey.js' file
const secret = require('./secretkey');

// Define an asynchronous function that takes user credentials and an optional token as input
module.exports = async (req, res) => {
  try {
    const { username, password } = req.body; // Extract username and password from the request body

    // Check if both username and password are provided and there are no extra fields in the request
    if (!username || !password || Object.keys(req.body).length !== 2) {
      throw new Error('invalid request data.');
    }

    
  } catch (error) {
    return res.status(200).json({ type: 'ERROR', message: error.message, action: 'RELOGIN' });
  }
};

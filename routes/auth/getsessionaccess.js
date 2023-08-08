const jwt = require('jsonwebtoken');
const { pool } = require('../dbconfig');
const secret = require('./secretkey');
const settings = require("../../settings");

module.exports = async (usercredentials) => {
  // Extract user credentials
  const { user_id, user_role, refresh_token } = usercredentials;
  // Retrieve the actual secret key from the 'secretkey.js' file using optional chaining (?.)
  const secretKey = secret?.secret_key;

  try {
    // Verify the refresh token using async/await approach
    let refreshedToken = null;
    try {
      const decoded = await jwt.verify(refresh_token, secretKey);
      // If the refresh token is valid, the decoded object will contain the payload
      refreshedToken = refresh_token;
    } catch (error) {
      // If there's an error with token verification, generate a new refresh token
      refreshedToken = await jwt.sign({ user_id: user_id, user_role: user_role }, secretKey, { expiresIn: settings?.token_refresh_timeout, issuer: settings?.token_issuer, subject: 'user-authentication' });
    }

    // Generate a new access token
    const access_token = await jwt.sign({ user_id: user_id, user_role: user_role }, secretKey, { expiresIn: settings?.token_access_timeout, issuer: settings?.token_issuer, subject: 'user-authentication' });

    // Return the refreshed access token and the latest refresh token
    return { refresh_token: refreshedToken, access_token };
  } catch (error) {
    // If there's an error during the token handling process, return null
    logger.error(`error occured when trying to issue a token for user ${user_id}. ${error}`);
    return null;
  }
};

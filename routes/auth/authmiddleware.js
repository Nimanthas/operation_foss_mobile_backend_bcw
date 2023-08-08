const jwt = require('jsonwebtoken');
const secret = require('./secretkey');

// Get the secret key from the imported module
const secretKey = secret?.secret_key;

// Middleware function to authenticate the token in the request header
const authenticateToken = async (req, res, next) => {
  // Extract the 'Authorization' header from the request
  const { authorization } = req?.headers;

  // Check if the 'authorization' header exists in the request
  if (!authorization) {
    // If not provided, send an error response
    return res.status(200).json({ type: 'ERROR', error: 'authorization was not provided.', action: 'RELOGIN' });
  }

  // Extract the token from the 'Authorization' header after 'Bearer'
  const token = authorization && authorization.split(' ')[1];

  // Check if the token exists
  if (!token) {
    // If not provided, send an error response
    return res.status(401).json({ type: 'ERROR', message: 'authorization token not provided.', action: 'RELOGIN' });
  }

  try {
    // Verify the token using the secret key
    const user = jwt.verify(token, secretKey);

    // If the token is valid, set the decoded user data in the request object
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(403).json({ type: 'ERROR', message: 'invalid token.', action: 'ACCESSTOKENEXPIRED' });
  }
};

// Export the middleware function
module.exports = authenticateToken;

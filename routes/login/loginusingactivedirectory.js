// Import required modules
const activeDirectory = require('activeDirectory');
const adErrors = require('../../common/ad.errors.list');
const session = require('../../routes/auth/getsessionaccess');
const { pool } = require('../dbconfig');
const findCode= require('../common/findcode');

// Configuration for Active Directory
const config = {
  url: 'ldaps://col-dc-01.brandixlk.org:636', // URL of the Active Directory server
  baseDN: 'dc=domain,dc=com', // Base Distinguished Name (DN) for the Active Directory
  tlsOptions: {
    rejectUnauthorized: false // TLS options to allow self-signed certificates (not recommended in production)
  }
};

// Function to authenticate a user against Active Directory
const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    // Create a new activeDirectory instance with the provided configuration and user credentials
    const ad = new activeDirectory({ ...config, username: username.toLowerCase(), password });

    // Authenticate the user against Active Directory
    ad.authenticate(username, password, (err, auth) => {
      if (err) {
        // If authentication fails, find the error code and corresponding error message from the predefined list
        const errorCode = findCode(err.message);
        const errorObject = adErrors.find(item => item.code === errorCode);
        return reject(new Error(`user details are not valid. please try again. ${errorObject?.error}. (${err.message})`));
      }

      if (auth) {
        // If authentication is successful, resolve the promise with true
        return resolve(true);
      } else {
        // If authentication is not successful, reject the promise with an error message
        return reject(new Error('user authentication failed. please try again.'));
      }
    });
  });
};

// The main function that handles the request and authentication
module.exports = async (req, res) => {
  try {
    const { username, password } = req.body; // Extract username and password from the request body

    // Check if both username and password are provided and there are no extra fields in the request
    if (!username || !password || Object.keys(req.body).length !== 2) {
      throw new Error('invalid request data.');
    }

    // Authenticate the user with the provided credentials against Active Directory
    await authenticateUser(username, password);

    // Check if the user exists in the database
    const user = await checkuseraccess(username);

    if (!user) {
      throw new Error('user does not exist. please sign up.');
    }

    // If authentication is successful, generate a session token for the user
    let session_token = await session(user[0]);

    if (!session_token) {
      throw new Error('error occured when trying to issue an access token.');
    }

    await updaterefreshtoken(session_token?.refresh_token, username);
    // Respond with a success status and the session token
    return res.status(200).json({ type: 'SUCCESS', username, token: session_token?.access_token });
  } catch (error) {
    return res.status(200).json({ type: 'ERROR', message: error.message, action: 'RELOGIN' });
  }
};

async function checkuseraccess(username) {
  // Connect to the database pool
  const client = await pool.connect();
  try {
    // Query to select all size names from the sys_sizeorder table for a given size template ID and order them by size order
    const sqlqry = `SELECT user_id, refresh_token, user_role FROM system_users WHERE user_id = '${username}' AND status = 'true';`;
    // Execute the query and retrieve the results
    const result = await client.query(sqlqry);
    // Return the array of size objects
    return result.rows;
  } catch (error) {
    // Throw an error message if there's a problem with the query execution
    throw new Error(`something went wrong while retrieving the data from database for user ${username}.`);
  } finally {
    // Release the client connection after the query is done
    client.release();
  }
}

async function updaterefreshtoken(refresh_token, user_id) {
  // Connect to the database pool
  const client = await pool.connect();
  try {
    // Query to select all size names from the sys_sizeorder table for a given size template ID and order them by size order
    const sqlqry = `UPDATE system_users SET refresh_token='${refresh_token}', last_login=Now() WHERE user_id = '${user_id}';`;
    // Execute the query and retrieve the results
    const result = await client.query(sqlqry);
    // Return the array of size objects
    return result.rows;
  } catch (error) {
    // Throw an error message if there's a problem with the query execution
    throw new Error(`something went wrong while updating the login data in the database for user ${user_id}.`);
  } finally {
    // Release the client connection after the query is done
    client.release();
  }
}

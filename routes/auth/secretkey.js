const crypto = require('crypto');

// 256-bit (32-byte) random key and convert it to a hexadecimal string
const secureSecretKey = crypto.randomBytes(32).toString('hex');

module.exports = {
    secret_key: secureSecretKey,
};

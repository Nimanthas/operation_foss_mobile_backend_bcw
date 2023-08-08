const { pool } = require('../dbconfig');

module.exports = async (req, res) => {
  try {
    // Get the customer_id from the request parameters
    const { customer_id } = req.params;

    if (!customer_id) {
      // If customer_id is missing, throw an error
      throw new Error("Empty data set in request header to get file processing options from the database by customer.");
    }

    // SQL query to fetch file processing options for the given customer_id
    const sqlqry = `SELECT option_id, option_name, option_process_type FROM system_options WHERE customer_id=${customer_id} AND status='true' ORDER BY option_id ASC;`;
    const { rows } = await pool.query(sqlqry);

    res.status(200).json({ type: "SUCCESS", data: rows });
  } catch (error) {
    res.status(200).json({ type: "ERROR", message: error?.message });
  }
};


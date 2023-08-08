const { pool } = require('../dbconfig');

module.exports = async (req, res) => {
  try {
    // SQL query to retrieve customer data
    const sqlqry = `SELECT customer_id, customer_name FROM system_customers WHERE status='true' ORDER BY customer_id ASC;`;
    const { rows } = await pool.query(sqlqry);

    res.status(200).json({ type: "SUCCESS", data: rows });
  } catch (error) {
    // If an error occurs during query execution or processing, handle the error
    res.status(200).json({ type: "ERROR", message: error?.message });
  }
};

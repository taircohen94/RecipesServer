require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool();

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

exports.execQuery = async function (query) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM users WHERE id = $1", [1]);
    console.log(res.rows[0]);
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
  }
};

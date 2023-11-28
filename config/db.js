require('dotenv').config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PWD,
  multipleStatements: true
});

connection.connect((err) => {
  if (err){
    throw err;
  }
  else {
    console.log("Connection established !!!");
  }
})

module.exports = connection;


require('dotenv').config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PWD
});

pool.execute('SELECT * FROM donhang', (err, result) => {
  if (err){
    console.log(err);
  }
  console.log(result);  
})



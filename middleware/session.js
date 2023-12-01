const session = require("express-session");
require('dotenv').config();
const MySQLStore = require("express-mysql-session")(session);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: true},
  store: new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    multipleStatements: true
  })
});

module.exports = sessionMiddleware;

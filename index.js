require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const session = require("express-session");
const bodyParser = require("body-parser");
// const MySQLStore = require("express-mysql-session")(session);

const userRouter = require("./route/user");
const dishRouter = require("./route/dish");
const tableRouter = require("./route/table");
const adminRouter = require("./route/admin");
const voucherRouter = require("./route/voucher");
const cartRouter = require("./route/cart");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    // secret: process.env.SESSION_SECRET,
    secret: "chicken sauce",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
  }),
);

app.use(userRouter);
app.use("/voucher", voucherRouter);
app.use("/dish", dishRouter);
app.use("/table", tableRouter);
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);

// Error handlers
// app.use((err, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle : 'Error !'
//   })
// })

// db.connect();

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

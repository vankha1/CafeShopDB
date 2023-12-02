require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const sessionMiddleware = require('./middleware/session');
const bodyParser = require("body-parser");


const userRouter = require("./route/user");
const dishRouter = require("./route/dish");
const tableRouter = require("./route/table");
const adminRouter = require("./route/admin");
const voucherRouter = require("./route/voucher");
const cartRouter = require("./route/cart");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use("/", sessionMiddleware, userRouter);
app.use("/voucher", sessionMiddleware, voucherRouter);
app.use("/dish", sessionMiddleware, dishRouter);
app.use("/table", sessionMiddleware,  tableRouter);
app.use("/admin", sessionMiddleware, adminRouter);
app.use("/cart", sessionMiddleware, cartRouter);

// Error handlers
// app.use((err, req, res, next) => {
//   res.status(500).render('500.ejs', {
//     pageTitle : 'Error !',
//     message: err.message
//   })
// })

// db.connect();

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

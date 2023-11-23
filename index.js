const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

const db = require('./config/db')

const userRouter = require('./route/user')
const dishRouter = require('./route/dish')
const tableRouter = require('./route/table')
const adminRouter = require('./route/admin')

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(userRouter)
app.use('/dish', dishRouter)
app.use('/table', tableRouter)
app.use('/admin', adminRouter)

// db.connect();

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

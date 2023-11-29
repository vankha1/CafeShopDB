const db = require("../config/db");

const invoicePage = (req, res) => {
  res.render("invoice.ejs", {
    pageTitle: "Invoice",
    isAuth: req.session.user_id,
  });
};

const addCart = (req, res) => {};

module.exports = {
  invoicePage,
  addCart,
};

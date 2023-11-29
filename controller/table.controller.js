const tablePage = (req, res) => {
  res.render("table.ejs", {
    pageTitle: "Table",
    isAuth: req.session.user_id,
  });
};

module.exports = {
  tablePage,
};

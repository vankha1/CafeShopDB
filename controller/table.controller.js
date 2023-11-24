const tablePage = (req, res) => {
  res.render("table.ejs", {
    pageTitle : 'Table'
  });
};

module.exports = {
  tablePage,
};

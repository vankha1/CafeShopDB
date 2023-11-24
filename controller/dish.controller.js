const dishPage = (req, res) => {
  res.render("dish.ejs", {
    pageTitle : 'Dish'
  });
};

module.exports = {
  dishPage,
};

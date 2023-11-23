const homePage = (req, res) => {
  res.render("homepage.ejs");
};

const profile = (req, res) => {
  res.render("profile.ejs");
}

const cartPage = (req, res) => {
  res.render("cart.ejs");
}

module.exports = {
  homePage,
  profile,
  cartPage
};

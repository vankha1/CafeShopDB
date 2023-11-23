const adminPage = (req, res) => {
  res.render("admin/admin.ejs");
};

const adminTablePage = (req, res) => {
  res.render("admin/adminTable.ejs");
}

const adminCartPage = (req, res) => {
  res.render("admin/adminCart.ejs");
}

const adminVoucherPage = (req, res) => {
  res.render("admin/adminVoucher.ejs");
}

const adminStaffPage = (req, res) => {
  res.render("admin/adminStaff.ejs");
}

module.exports = {
  adminPage,
  adminTablePage,
  adminCartPage,
  adminVoucherPage,
  adminStaffPage
};

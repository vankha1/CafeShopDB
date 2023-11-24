const adminPage = (req, res) => {
  res.render("admin/admin.ejs", {
    pageTitle : 'Admin'
  });
};

const adminTablePage = (req, res) => {
  res.render("admin/adminTable.ejs", {
    pageTitle : 'Admin'
  });
}

const adminCartPage = (req, res) => {
  res.render("admin/adminCart.ejs", {
    pageTitle : 'Admin'
  });
}

const adminVoucherPage = (req, res) => {
  res.render("admin/adminVoucher.ejs", {
    pageTitle : 'Admin'
  });
}

const adminStaffPage = (req, res) => {
  res.render("admin/adminStaff.ejs", {
    pageTitle : 'Admin'
  });
}

module.exports = {
  adminPage,
  adminTablePage,
  adminCartPage,
  adminVoucherPage,
  adminStaffPage
};

const db = require("../config/db");

const adminPage = (req, res, next) => {
  console.log(req.session.user_id);
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q =
    "SELECT Maloaimon, Ten, Kichco, Dongia, Loaimon FROM (mon NATURAL JOIN loaimon)";

  db.query(q, (err, dishes) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    const drinkDishes = dishes.filter((dish) => dish.Loaimon === "Nuoc uong");
    const anotherDishes = dishes.filter((dish) => dish.Loaimon === "Do an");

    res.render("admin/admin.ejs", {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      drinkDishes,
      anotherDishes,
    });
  });
};

const adminTablePage = (req, res, next) => {
  console.log(req.session.user_id);
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM bookingtables";

  db.query(q, (err, tables) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    const fullTables = tables.filter((table) => table.current_status === 1);

    res.render("admin/adminTable.ejs", {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      tables,
      fullTables,
    });
  });
};

const adminTableDetail = (req, res, next) => {
  console.log(req.session.user_id);
  const { tableId, startDate, startTime, endDate, endTime } = req.body;

  const q = "SELECT tongTienTheoBan(?) AS DoanhThu";
  db.query(
    q,
    [[tableId, startDate, startTime, endDate, endTime]],
    (err, result) => {
      if (err) {
        res.status(500).render("500.ejs", {
          pageTitle: "Error !",
          message: err.message,
        });
        return;
      }

      console.log(result[0].DoanhThu);

      res.render("crud/viewTable.ejs", {
        pageTitle: "View Table",
        tableId,
        startDate,
        startTime,
        endDate,
        endTime,
        doanhThu: result[0].DoanhThu,
      });
    }
  );
};

const adminCartPage = (req, res, next) => {
  console.log(req.session.user_id);
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM donhang";

  db.query(q, (err, orders) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.render("admin/adminCart.ejs", {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      orders,
    });
  });
};

const adminCartView = (req, res, next) => {
  console.log(req.session.user_id);
  const id = parseInt(req.params.id);

  const q = "CALL showOrderInfo (?)";

  db.query(q, [[id]], (err, result) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(result[0]);
    let sumOfPrices = 0;
    result[0].forEach((dish) => {
      sumOfPrices += dish.tong_gia;
    });
    res.render("crud/viewCart.ejs", {
      pageTitle: "View detail cart",
      isAuth: req.session.user_id,
      carts: result[0],
      sumOfPrices,
      path: "/admin/cart/view",
    });
  });
};

// Voucher

const adminVoucherPage = (req, res, next) => {
  console.log(req.session.user_id);
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM (voucher_type NATURAL JOIN voucher_effective_time)";

  db.query(q, (err, voucher) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    voucher.forEach((v) => {
      // let dateStart = new Date(v.start_time)
      // let dateEnd = new Date(v.end_time)

      v.start_time = new Date(v.start_time).toLocaleDateString("en-GB");
      v.end_time = new Date(v.end_time).toLocaleDateString("en-GB");
    });

    res.render("admin/adminVoucher.ejs", {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      voucher,
    });
  });
};

// Staff

const adminStaffPage = (req, res, next) => {
  console.log(req.session.user_id);
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM nhanvien";

  db.query(q, (err, staffs) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(staffs);
    res.render("admin/adminStaff.ejs", {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      staffs,
      result: 'Nothing'
    });
  });
};

const findInvoiceAndStaff = (req, res) => {
  const maxSalary = req.body.maxSalary;

  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM nhanvien";

  db.query(q, (err, staffs) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    const q1 = "CALL InThongTinNhanVienVaHoaDon(?)";

    db.query(q1, [parseInt(maxSalary)], (err, result) => {
      if (err) {
        res.status(500).render("500.ejs", {
          pageTitle: "Error !",
          message: err.message,
        });
        return;
      }
      res.render("admin/adminStaff.ejs", {
        pageTitle: "Admin",
        isAuth: req.session.user_id,
        staffs,
        result: result[0]
      });
    });
  });
};

const deleteStaff = (req, res, next) => {
  const id = req.params.id;

  const q = "CALL XoaNhanVien(?)";

  db.query(q, [id], (err, result) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.redirect("/admin/staff");
  });
};

module.exports = {
  adminPage,
  adminTablePage,
  adminTableDetail,
  adminCartPage,
  adminCartView,
  adminVoucherPage,
  adminStaffPage,
  findInvoiceAndStaff,
  deleteStaff,
};

const db = require("../config/db");

const adminPage = (req, res) => {
  try {
    console.log(req.session.user_id);
    if (req.session.user_id !== "admin") {
      res.send("You are not an administrator");
      return;
    }

    const q =
      "SELECT Maloaimon, Ten, Kichco, Dongia, Loaimon FROM (mon NATURAL JOIN loaimon)";

    db.query(q, (err, dishes) => {
      if (err) {
        throw err;
      }
      const drinkDishes = dishes.filter((dish) => dish.Loaimon === "Nuoc uong");
      const anotherDishes = dishes.filter((dish) => dish.Loaimon === "Do an");

      res.render("admin/admin.ejs", {
        pageTitle: "Admin",
        isAuth: true,
        drinkDishes,
        anotherDishes,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const adminTablePage = (req, res) => {
  try {
    console.log(req.session.user_id);
    if (req.session.user_id !== "admin") {
      res.send("You are not an administrator");
      return;
    }

    const q = "SELECT * FROM bookingtables";

    db.query(q, (err, tables) => {
      if (err) {
        throw err;
      }

      const fullTables = tables.filter((table) => table.current_status === 1);

      res.render("admin/adminTable.ejs", {
        pageTitle: "Admin",
        isAuth: true,
        tables,
        fullTables,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const adminTableDetail = (req, res) => {
  try {
    console.log(req.session.user_id);
    const { tableId, startDate, startTime, endDate, endTime } = req.body;

    const q = "SELECT tongTienTheoBan(?) AS DoanhThu";
    db.query(
      q,
      [[tableId, startDate, startTime, endDate, endTime]],
      (err, result) => {
        if (err) throw err;

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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const adminCartPage = (req, res) => {
  try {
    console.log(req.session.user_id);
    if (req.session.user_id !== "admin") {
      res.send("You are not an administrator");
      return;
    }

    const q = "SELECT * FROM donhang";

    db.query(q, (err, orders) => {
      if (err) throw err;
      res.render("admin/adminCart.ejs", {
        pageTitle: "Admin",
        isAuth: true,
        orders,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const adminCartView = (req, res) => {
  try {
    console.log(req.session.user_id);
    const id = parseInt(req.params.id);

    const q = "CALL showOrderInfo (?)";

    db.query(q, [[id]], (err, result) => {
      if (err) throw err;
      console.log(result[0]);
      let sumOfPrices = 0;
      result[0].forEach((dish) => {
        sumOfPrices += dish.tong_gia;
      });
      res.render("crud/viewCart.ejs", {
        pageTitle: "View detail cart",
        carts: result[0],
        sumOfPrices,
        path: "/admin/cart/view",
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Voucher

const adminVoucherPage = (req, res) => {
  try {
    console.log(req.session.user_id);
    if (req.session.user_id !== "admin") {
      res.send("You are not an administrator");
      return;
    }

    const q =
      "SELECT * FROM (voucher_type NATURAL JOIN voucher_effective_time)";

    db.query(q, (err, voucher) => {
      if (err) {
        throw err;
      }
      voucher.forEach((v) => {
        // let dateStart = new Date(v.start_time)
        // let dateEnd = new Date(v.end_time)

        v.start_time = new Date(v.start_time).toLocaleDateString("en-GB");
        v.end_time = new Date(v.end_time).toLocaleDateString("en-GB");
      });

      res.render("admin/adminVoucher.ejs", {
        pageTitle: "Admin",
        isAuth: true,
        voucher,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Staff

const adminStaffPage = (req, res) => {
  try {
    console.log(req.session.user_id);
    if (req.session.user_id !== "admin") {
      res.send("You are not an administrator");
      return;
    }

    const q = "SELECT * FROM nhanvien";

    db.query(q, (err, staffs) => {
      if (err) {
        throw err;
      }
      console.log(staffs);
      res.render("admin/adminStaff.ejs", {
        pageTitle: "Admin",
        isAuth: true,
        staffs,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteStaff = (req, res) => {
  try {
    const id = req.params.id;

    const q = "CALL XoaNhanVien(?)";

    db.query(q, [id], (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/staff");
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  adminPage,
  adminTablePage,
  adminTableDetail,
  adminCartPage,
  adminCartView,
  adminVoucherPage,
  adminStaffPage,
  deleteStaff,
};

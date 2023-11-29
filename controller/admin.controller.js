const db = require("../config/db");

const adminPage = (req, res) => {
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
};

const adminTablePage = (req, res) => {
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
};

const adminCartPage = (req, res) => {
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }
  res.render("admin/adminCart.ejs", {
    pageTitle: "Admin",
    isAuth: true,
  });
};

// Voucher

const adminVoucherPage = (req, res) => {
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM (voucher_type NATURAL JOIN voucher_effective_time)";

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
};

// Staff

const adminStaffPage = (req, res) => {
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
};

const deleteStaff = (req, res) => {
  const id = req.params.id;

  const q = "CALL XoaNhanVien(?)";

  db.query(q, [id], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect("/admin/staff");
  });
};

module.exports = {
  adminPage,
  adminTablePage,
  adminCartPage,
  adminVoucherPage,
  adminStaffPage,
  deleteStaff,
};

const db = require("../config/db");

const adminPage = (req, res, next) => {
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q =
    "SELECT loaimon.Maloaimon, Ten, Kichco, Dongia, Loaimon, current_status FROM (mon RIGHT OUTER JOIN loaimon on mon.Maloaimon = loaimon.Maloaimon);";

  db.query(q, (err, dishes) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    dishes = dishes.reduce((acc, cur) => {
      let existingIndex = acc.findIndex(
        (item) =>
          item.Maloaimon === cur.Maloaimon &&
          item.Ten === cur.Ten &&
          item.Loaimon === cur.Loaimon
      );

      if (existingIndex === -1) {
        acc.push({
          Maloaimon: cur.Maloaimon,
          Ten: cur.Ten,
          Loaimon: cur.Loaimon,
          Kichco: [cur.Kichco],
          Dongia: [cur.Dongia],
          current_status: [cur.current_status]
        });
      } else {
        acc[existingIndex].Kichco.push(cur.Kichco);
        acc[existingIndex].Dongia.push(cur.Dongia);
        acc[existingIndex].current_status.push(cur.current_status);
      }
      return acc;
    }, []);
    console.log(dishes);
    const noDishes = dishes.filter((dish) => dish.current_status.includes(1) === false);
    const drinkDishes = dishes.filter((dish) => dish.Loaimon === "Do uong" && !noDishes.includes(dish));
    const anotherDishes = dishes.filter((dish) => dish.Loaimon === "Do an" && !noDishes.includes(dish));
    console.log(drinkDishes);

    res.render("admin/admin.ejs", {
      pageTitle: "Admin",
      path: 'Mon',
      isAuth: req.session.user_id,
      drinkDishes,
      anotherDishes,
      noDishes
    });
  });
};

const adminTablePage = (req, res, next) => {
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
      path: 'Table',
    });
  });
};

const adminTableDetail = (req, res, next) => {
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

// Cart
const adminCartPage = (req, res, next) => {
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
      path: 'Cart',
    });
  });
};

const adminCartView = (req, res, next) => {
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
      path: 'Voucher',
    });
  });
};

// Staff

const adminStaffPage = (req, res, next) => {
  if (req.session.user_id !== "admin") {
    res.send("You are not an administrator");
    return;
  }

  const q = "SELECT * FROM nhanvien WHERE statusNV = 1";

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
      result: 'Nothing',
      path: 'Staff'
    });
  });
};

const sortByName = (req, res) => {
  const q = "CALL SapXepNhanVienTheoTen()";

  db.query(q, (err, staffs) => {
    if (err){
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    console.log(staffs);

    res.render('admin/adminStaff.ejs', {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      staffs: staffs[0],
      result: 'Nothing',
      path: 'Staff'
    })
  })
}

const findByName = (req, res) => {
  const stringName = req.body.stringName;

  const q = "CALL TimKiemNhanVien(?)";

  db.query(q, [stringName], (err, staffs) => {
    if (err){
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    console.log(staffs);

    res.render('admin/adminStaff.ejs', {
      pageTitle: "Admin",
      isAuth: req.session.user_id,
      staffs: staffs[0],
      result: 'Nothing',
      path: 'Staff'
    })
  })
}

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
        result: result[0],
        path: "Staff"
      });
    });
  });
};

const getUpdateStaff = (req, res) => {
  const id = parseInt(req.params.id);

  const q = "SELECT * FROM nhanvien WHERE MaNV = ?"
  db.query(q, [[id]], (err, staff) => {
    if (err){
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.render('crud/updateStaff.ejs', {
      pageTitle: "Update Staff",
      staff: staff[0]
    })
  })
}

const updateStaff = (req, res) => {
  const id = req.params.id;
  const supervisorID = parseInt(req.body.supervisorID);
  const salary = parseInt(req.body.salary);

  const q = "CALL SuaLuongVaMaGiamSatNhanVien(?)";
  db.query(q, [[id, salary, supervisorID]], (err, result) => {
    if (err){
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.redirect("/admin/staff");
  })  
}

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
  sortByName,
  findByName,
  findInvoiceAndStaff,
  getUpdateStaff,
  updateStaff,
  deleteStaff,
};

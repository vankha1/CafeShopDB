const db = require("../config/db");

const dishPage = (req, res, next) => {
  const q =
    "SELECT Maloaimon, Ten, Loaimon, Kichco, dongia, current_status FROM (loaimon natural join mon)";

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
          dongia: [cur.dongia],
          current_status: [cur.current_status],
        });
      } else {
        acc[existingIndex].Kichco.push(cur.Kichco);
        acc[existingIndex].dongia.push(cur.dongia);
        acc[existingIndex].current_status.push(cur.current_status);
      }
      return acc;
    }, []);

    const drinkDishes = dishes.filter((dish) => dish.Loaimon === "Do uong");
    const anotherDishes = dishes.filter((dish) => dish.Loaimon === "Do an");

    res.render("dish.ejs", {
      pageTitle: "Dish",
      isAuth: req.session.user_id,
      drinkDishes,
      anotherDishes,
    });
  });
};

const addToCart = (req, res, next) => {
  const nameDishes = req.body.nameDish;
  const nameCustomer = req.body.nameCustomer;
  const addressCustomer = req.body.addressCustomer;
  const cardNumber = parseInt(req.body.cardNumber);
  const voucherId = req.body.voucherId ? req.body.voucherId : "";
  const voucherSerial = req.body.voucherSerial ? req.body.voucherSerial : "";

  let orderedDishes = { ...req.body };

  for (let key in orderedDishes) {
    if (orderedDishes[key] && !orderedDishes[key].includes("on")) {
      delete orderedDishes[key];
    }
  }


  console.log(orderedDishes);
  // const cart = { ...result, nameCustomer, addressCustomer, cardNumber };
  // console.log(cart);
  const q = "SELECT insertAndGetID (?)";
  db.query(
    q,
    [
      [
        nameCustomer,
        addressCustomer,
        cardNumber,
        parseInt(voucherId),
        parseInt(voucherSerial),
      ],
    ],
    (err, result) => {
      if (err) {
        res.status(500).render("500.ejs", {
          pageTitle: "Error !",
          message: err.message,
        });
        return;
      }

      const idDonHang = Object.values(result[0])[0];

      for (const key in orderedDishes) {
        const MaLoaiMon = key.match(/\d+/g).join("");
        const Kichco = key.replace(/[0-9]/g, "");
        const Giatheongay = orderedDishes[key][2];
        const Soluong = orderedDishes[key][1];

        const q1 =
          "INSERT INTO thuocvemon (Mamon, Madonhang, Kichco, Giatheongay, Soluong) VALUES (?)";
        db.query(
          q1,
          [[MaLoaiMon, idDonHang, Kichco, Giatheongay, Soluong]],
          (err, result) => {
            if (err) {
              res.status(500).render("500.ejs", {
                pageTitle: "Error !",
                message: err.message,
              });
              return;
            }
          }
        );
      }

      const q2 = "INSERT INTO payment_apply VALUES (?); CALL deleteVoucher_card(?)";

      db.query(q2, [[idDonHang, voucherSerial, voucherId], [voucherId, voucherSerial]], (err, result) => {
        if (err) {
          res.status(500).render("500.ejs", {
            pageTitle: "Error !",
            message: err.message,
          });
          return;
        }

        res.render("success.ejs", {
          message: "Bạn đã thêm đơn hàng thành công"
        });
      })
      
    }
  );
};

const getAddDish = (req, res, next) => {
  const idMaloaimon = req.params.id;

  res.render("crud/addDish.ejs", {
    pageTitle: "Add dish",
    nameBtn: "Them",
    idMaloaimon,
  });
};

const addDish = (req, res, next) => {
  const { foodType, size, price } = req.body;

  // console.log(foodType, size, price);
  // res.send('fsa')
  // return;

  const q1 = "SELECT count(*) as count FROM loaimon";

  db.query(q1, (err, result) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    const count = result[0].count;

    if (foodType > count || foodType <= 0) {
      const error = new Error("Food type is out of range !");

      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: error.message,
      });
      return;
    }

    const q2 = "CALL themmon (?)";

    db.query(q2, [[foodType, size, price]], (err, result) => {
      if (err) {
        res.status(500).render("500.ejs", {
          pageTitle: "Error !",
          message: err.message,
        });
        return;
      }

      res.redirect("/admin");
    });
  });
};

const getUpdateDish = (req, res, next) => {
  const id = req.params.id;

  const maLoaiMon = id.match(/\d+/g).join("");
  const size = id.replace(/[0-9]/g, "");

  console.log(maLoaiMon, size);
  const q = "SELECT * FROM mon WHERE Maloaimon = ? AND Kichco = ?";

  db.query(q, [[maLoaiMon], [size]], (err, dish) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.render("crud/addDish", {
      pageTitle: "Update dish",
      dish: dish[0],
      nameBtn: "Cap nhat",
    });
  });
};

const updateDish = (req, res, next) => {
  const { foodType, size, price } = req.body;

  // console.log(foodType, size, price );
  // res.send('...')
  // return;

  const q = "UPDATE mon SET Dongia = ? WHERE Maloaimon = ? AND Kichco = ?";

  db.query(q, [price, foodType, size], (err, result) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(result);
    res.redirect("/admin");
  });
};

const deleteDish = (req, res, next) => {
  const id = req.params.id;

  const maLoaiMon = id.match(/\d+/g).join("");
  const size = id.replace(/[0-9]/g, "");

  const q =
    "UPDATE mon SET current_status = 0 WHERE Maloaimon = ? AND Kichco = ?";

  db.query(q, [maLoaiMon, size], (err) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    res.redirect("/admin");
  });
};

module.exports = {
  dishPage,
  addToCart,
  getAddDish,
  addDish,
  getUpdateDish,
  updateDish,
  deleteDish,
};

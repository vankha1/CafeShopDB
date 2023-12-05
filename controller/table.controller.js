const db = require("../config/db");

const tablePage = (req, res, next) => {
  const q = "SELECT * FROM (bookingtables LEFT OUTER JOIN bookinginfo ON bookingtables.ID = bookinginfo.fk_tableID)";

  db.query(q, (err, tables) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(tables);

    res.render("table.ejs", {
      pageTitle: "Table",
      isAuth: req.session.user_id,
      tables,
    });
  });
};

const addTableToCart = (req, res, next) => {
  // console.log(req.body);
  // res.send('Add success');
  // return;

  const {
    tableId,
    nameCustomer,
    addressCustomer,
    startDate,
    startTime,
    endTime,
  } = req.body;

  if (startTime > endTime) {
    res.render("500.ejs", {
      message: "Start time is over end time"
    });
    return;
  }

  const isoDate = new Date();
  const mySQLDateString = isoDate
    .toJSON()
    .slice(0, 19)
    .replace("T", " ")
    .split(" ");

  const orderDate = mySQLDateString[0];
  const orderTime = mySQLDateString[1];

  const q = "SELECT * FROM customers WHERE name = ? AND address = ?";

  db.query(q, [[nameCustomer], [addressCustomer]], (err, customer) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    console.log(customer);

    if (customer.length > 0) {
      const q1 = "INSERT INTO  DonHang () VALUES ()";
      db.query(q1, (err, result) => {
        if (err) {
          res.status(500).render("500.ejs", {
            pageTitle: "Error !",
            message: err.message,
          });
          return;
        }
        const idDonHang = result.insertId;
        const customerId = customer[0].ID;
        const q2 =
          "INSERT INTO dondattruoc (MaDonHang, MaBan) VALUES (?); INSERT INTO bookinginfo (fk_tableID, fk_customerID, orderDate, orderTime, startDate, startTime, endTime) VALUES (?)";

        db.query(
          q2,
          [
            [idDonHang, tableId],
            [
              tableId,
              customerId,
              orderDate,
              orderTime,
              startDate,
              startTime,
              endTime,
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

            console.log(result[0], result[1]);
            res.render('success.ejs', {
              message: "Bạn đã đặt bàn thành công !!!"
            });
          }
        );
      });
    } else if (customer.length === 0) {
      const q1 =
        "INSERT INTO  DonHang () VALUES (); INSERT INTO customers (name, address) VALUES (?)";

      db.query(q1, [[nameCustomer, addressCustomer]], (err, result) => {
        if (err) {
          res.status(500).render("500.ejs", {
            pageTitle: "Error !",
            message: err.message,
          });
          return;
        }

        console.log(result[0], result[1]);

        const idDonHang = result[0].insertId;
        const customerId = result[1].insertId;

        const q2 =
          "INSERT INTO dondattruoc (MaDonHang, MaBan) VALUES (?); INSERT INTO bookinginfo (fk_tableID, fk_customerID, orderDate, orderTime, startDate, startTime, endTime) VALUES (?)";

        db.query(
          q2,
          [
            [idDonHang, tableId],
            [
              tableId,
              customerId,
              orderDate,
              orderTime,
              startDate,
              startTime,
              endTime,
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

            console.log(result[0], result[1]);
            res.render('success.ejs', {
              message: "Bạn đã đặt bàn thành công !!!"
            });
          }
        );
      });
    }
  });
};

module.exports = {
  tablePage,
  addTableToCart,
};

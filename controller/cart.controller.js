const db = require("../config/db");

const invoicePage = (req, res, next) => {
  try {
    const q = "SELECT * FROM donhang";
  
    db.query(q, (err, orders) => {
      if (err) throw err;
      res.render("invoice.ejs", {
        pageTitle: "Invoice",
        isAuth: req.session.user_id,
        orders,
      });
    });
  } catch (err) {
    if (!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
};

const viewBeforeExport = (req, res, next) => {
  try {
    const id = req.params.id;
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
        idCart: id,
        idStaff: req.session.user_id,
        sumOfPrices,
        path: "/invoice/preview",
      });
    });
  } catch (err) {
    if (!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
};

const invoiceExport = (req, res, next) => {
  try {
    const { cartId, staffId, priceSum } = req.body;
  
    const isoDate = new Date();
    const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ').split(' ');
  
    const exportDate = mySQLDateString[0];
    const exportTime = mySQLDateString[1];
  
    const q = "INSERT INTO hoadon (tongGia) VALUES (?)"
  
    db.query(q, [[priceSum]], (err, result) => {
      if (err){
        throw err;
      }
  
      const invoiceId = result.insertId;
      const q1 = "INSERT INTO xuat (MaNV, MaHD, MaDH, NgayXuat, GioXuat) VALUES (?)";
  
      db.query(q1, [[staffId, invoiceId, cartId, exportDate, exportTime]], (err, result) => {
        if (err){
          throw err; 
        }
        // console.log(r);
        res.send('success......');
      })
    })
  } catch (err) {
    if (!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  invoicePage,
  viewBeforeExport,
  invoiceExport,
};

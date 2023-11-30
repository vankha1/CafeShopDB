const db = require('../config/db')

const tablePage = (req, res) => {

  const q = "SELECT * FROM (bookingtables)"

  db.query(q, (err, tables) => {

    if (err){
      throw err;
    }
    console.log(tables);

    res.render("table.ejs", {
      pageTitle : 'Table',
      isAuth: req.session.user_id,
      tables
    });
  })
};

const addTableToCart = (req, res) => {

  // console.log(req.body);
  // res.send('Add success');
  // return;
  const { tableId, nameCustomer, addressCustomer, startDate, startTime, endTime } = req.body;

  if (startTime > endTime){
    res.send('Start time is over end time');
    return;
  }

  const q = "INSERT INTO  DonHang () VALUES (); INSERT INTO customers (name, address) VALUES (?)"

  db.query(q, [[nameCustomer, addressCustomer]],  (err, result) => {
    if (err){
      throw err;
    }

    console.log(result[0], result[1]); 

    const idDonHang = result[0].insertId;
    const customerId = result[1].insertId;

    const isoDate = new Date();
    const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ').split(' ');

    const orderDate = mySQLDateString[0];
    const orderTime = mySQLDateString[1];

    const q1 = "INSERT INTO dondattruoc (MaDonHang, MaBan) VALUES (?); INSERT INTO bookinginfo (fk_tableID, fk_customerID, orderDate, orderTime, startDate, startTime, endTime) VALUES (?)";

    db.query(q1, [[idDonHang, tableId], [tableId, customerId, orderDate, orderTime, startDate, startTime, endTime]], (err, result) => {
      if (err) throw err;

      console.log(result[0], result[1]);

      res.send('Add success');
    })
  })
}


module.exports = {
  tablePage,
  addTableToCart
};

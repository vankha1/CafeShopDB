const db = require("../config/db");

const getAddVoucher = (req, res, next) => {
  const id = req.params.id;

  res.render("crud/addVoucher.ejs", {
    pageTitle: "Add Voucher",
    id,
    option: "add",
  });
};

const addVoucher = (req, res, next) => {
  const id = req.params.id;
  const stt = req.body.stt;

  const q = "CALL addVoucher_card (?)";

  db.query(q, [[parseInt(id), parseInt(stt)]], (err, cards) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    res.redirect('/admin/voucher');
  });
};

const getDeleteVoucher = (req, res, next) => {
  const id = req.params.id;

  const q = "SELECT STT FROM voucher_card WHERE id = ? AND current_status = 1";

  db.query(q, [id], (err, result) => {

    if (err){
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(result);
    res.render("crud/addVoucher.ejs", {
      pageTitle: "Add Voucher",
      id,
      option: "delete",
      voucher: result
    });
  })

};
const deleteVoucher = (req, res, next) => {
  const id = req.params.id;
  const stt = req.body.stt;

  const q = "CALL deleteVoucher_card (?)";

  db.query(q, [[parseInt(id), parseInt(stt)]], (err, cards) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }

    res.redirect('/admin/voucher');
  });
};

module.exports = {
  getAddVoucher,
  addVoucher,
  getDeleteVoucher,
  deleteVoucher,
};

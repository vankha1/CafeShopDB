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
  try {
    const id = req.params.id;
    const stt = req.body.stt;

    const q = "SELECT * FROM voucher_card where id = ?";

    db.query(q, [id], (err, cards) => {
      if (err) {
        throw err;
      }

      const isExist = cards.some((card) => card.STT === parseInt(stt));

      // console.log(isExist, cards);

      if (isExist) {
        res.send("card already exists");
      } else {
        db.query(
          "insert into voucher_card (id, stt) values (?)",
          [[parseInt(id), parseInt(stt)]],
          (err) => {
            res.redirect("/admin/voucher");
          }
        );
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getDeleteVoucher = (req, res, next) => {
  const id = req.params.id;

  res.render("crud/addVoucher.ejs", {
    pageTitle: "Add Voucher",
    id,
    option: "delete",
  });
};
const deleteVoucher = (req, res, next) => {
  try {
    const id = req.params.id;
    const stt = req.body.stt;

    const q = "SELECT * FROM voucher_card where id = ?";

    db.query(q, [id], (err, cards) => {
      if (err) {
        throw err;
      }

      const isExist = cards.some((card) => card.STT === parseInt(stt));

      // console.log(isExist, cards);

      if (!isExist) {
        res.send("card doesn't exists");
      } else {
        db.query(
          "delete from voucher_card where stt = ?",
          [parseInt(stt)],
          (err) => {
            res.redirect("/admin/voucher");
          }
        );
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  getAddVoucher,
  addVoucher,
  getDeleteVoucher,
  deleteVoucher,
};

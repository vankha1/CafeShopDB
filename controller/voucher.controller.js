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

  const q = "SELECT * FROM voucher_card where id = ?";

  db.query(q, [id], (err, cards) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
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
          if (err) {
            res.status(500).render("500.ejs", {
              pageTitle: "Error !",
              message: err.message,
            });
            return;
          }
          res.redirect("/admin/voucher");
        }
      );
    }
  });
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
  const id = req.params.id;
  const stt = req.body.stt;

  const q = "SELECT * FROM voucher_card where id = ?";

  db.query(q, [id], (err, cards) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
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
          if (err) {
            res.status(500).render("500.ejs", {
              pageTitle: "Error !",
              message: err.message,
            });
            return;
          }
          res.redirect("/admin/voucher");
        }
      );
    }
  });
};

module.exports = {
  getAddVoucher,
  addVoucher,
  getDeleteVoucher,
  deleteVoucher,
};

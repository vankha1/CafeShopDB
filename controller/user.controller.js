const db = require("../config/db");
const utils = require("../utils/validateDate");

const getSignup = (req, res, next) => {
  res.render("auth/signup.ejs", {
    pageTitle: "Them nhan vien",
  });
};

const signup = (req, res, next) => {
  const { email, password, fullname, address, dateOfBirth, phoneNumber } =
    req.body;

  const salary = parseInt(req.body.salary);
  const supervisorID = parseInt(req.body.supervisorID);

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    res.status(500).render("500.ejs", {
      pageTitle: "Error !",
      message: error.message,
    });
    return;
  }

  const q = "SELECT MaNV FROM nhanvien WHERE statusNV = 1";

  db.query(q, (err, staffs) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    if (!staffs.some((staff) => staff.MaNV === supervisorID)) {
      const error = new Error("The supervisor does not exists");
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: error.message,
      });
      return;
    }
    const q1 = "CALL ThemNhanVien(?)";

    db.query(
      q1,
      [
        [
          fullname,
          email,
          password,
          address,
          dateOfBirth,
          phoneNumber,
          supervisorID,
          salary,
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
        console.log(result);
        res.redirect("/admin/staff");
      }
    );
  });
};

const getLogin = (req, res, next) => {
  res.render("auth/login.ejs", {
    pageTitle: "Login",
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (email === "vovankha@gmail.com" && password === "123456") {
    req.session.user_id = "admin";
    res.redirect("/");
    return;
  }

  if (email && password) {
    const query = "SELECT MaNV, email, mk FROM nhanvien where email = ? and statusNV = 1";

    db.query(query, [email], (err, user) => {
      // if (!user || user.length === 0){
      //   res.send("Please sign up");
      //   return
      // }
      // console.log(user);
      if (user.length > 0) {
        for (let i = 0; i < user.length; i++) {
          if (user[i].mk === password) {
            req.session.user_id = user[i].MaNV;
            req.session.save();
            res.redirect("/");
          }
        }
      } else {
        res.render("500.ejs", {
          message: "Email hoặc mật khẩu sai hoặc nhân viên đã nghỉ làm !!!"
        });
      }
    });
  }
};

const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
};

const homePage = (req, res, next) => {
  const q = "SELECT * FROM loaimon";

  db.query(q, (err, dishTypes) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    res.render("homepage.ejs", {
      isAuth: req.session.user_id,
      pageTitle: "Cafe Shop",
      dishTypes,
    });
  });
};

const profile = (req, res, next) => {
  const id = req.session.user_id;
  console.log(id);

  const q = "SELECT * FROM nhanvien WHERE MaNV = ?";

  db.query(q, [id], (err, staff) => {
    if (err) {
      res.status(500).render("500.ejs", {
        pageTitle: "Error !",
        message: err.message,
      });
      return;
    }
    console.log(staff);
    res.render("profile.ejs", {
      pageTitle: "Profile",
      isAuth: req.session.user_id,
      staff: staff[0],
    });
  });
};

const updateProfile = (req, res, next) => {
  const id = req.params.id;
  const {
    email,
    name,
    password,
    address,
    phoneNumber,
    dateOfBirth
  } = req.body;

  if (password.length < 6){
    const error = new Error('Password must be at least 6 characters');
    res.status(500).render("500.ejs", {
      pageTitle: "Error !",
      message: error.message,
    });
    return;
  }

  const q = "CALL SuaThongTinNhanVien(?)";

  db.query(
    q,
    [
      [
        id,
        name,
        email, 
        password,
        address,
        dateOfBirth,
        phoneNumber
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
      console.log(result);
      res.redirect("/");
    }
  );
};

module.exports = {
  getSignup,
  signup,
  getLogin,
  login,
  logout,
  homePage,
  updateProfile,
  profile,
};

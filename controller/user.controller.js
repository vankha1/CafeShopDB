const db = require("../config/db");
const utils = require("../utils/validateDate");

const getSignup = (req, res) => {
  res.render("auth/signup.ejs", {
    pageTitle: "Signup",
  });
};

const signup = (req, res) => {
  const { email, password, fullname, address, dateOfBirth, phoneNumber } =
    req.body;

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
  }
  if (!utils.isValidDate(dateOfBirth)) alert("Please enter a valid date");

  const q =
    "INSERT INTO nhanvien (HoVaTen, email, password, DiaChi, NgaySinh, SDT, statusNV) VALUES (?)";

  db.query(
    q,
    [[fullname, email, password, address, dateOfBirth, phoneNumber, 1]],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("/login");
    },
  );
};

const getLogin = (req, res) => {
  res.render("auth/login.ejs", {
    pageTitle: "Login",
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (email === "vovankha@gmail.com" && password === "123456") {
    req.session.user_id = "admin";
    res.redirect("/");
    return;
  }

  if (email && password) {
    const query = "SELECT MaNV, email, mk FROM nhanvien where email = ?";

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
            res.redirect("/");
          }
        }
      } else {
        res.send("Incorrect Email Address");
      }
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
};

const homePage = (req, res) => {
  const q = "SELECT * FROM mon";

  db.query(q, (err, dishTypes) => {
    if (err) {
      next(err);
    }
    res.render("homepage.ejs", {
      isAuth: req.session.user_id,
      pageTitle: "Cafe Shop",
      dishTypes,
    });
  });
};

const profile = (req, res) => {
  res.render("profile.ejs", {
    pageTitle: "Profile",
    isAuth: req.session.user_id,
  });
};

const updateProfile = (req, res) => {
  const id = req.params.id;
  const {
    email,
    name,
    password,
    address,
    phoneNumber,
    dateOfBirth,
    supervisorID,
    salary,
  } = req.body;

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
        phoneNumber,
        supervisorID,
        salary,
      ],
    ],
    (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      res.redirect("/");
    },
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

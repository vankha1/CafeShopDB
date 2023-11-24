const db = require("../config/db");
const utils = require('../utils/validateDate');

const getSignup = (req, res) => {
  res.render('auth/signup.ejs', {
    pageTitle: 'Signup'
  });
}

const signup = (req, res) => {
  const { email, password, fullname, address, dateOfBirth, phoneNumber} = req.body;

  if (password.length < 6){
    console.log('Password must be at least 6 characters'); 
  }
  if (!utils.isValidDate(dateOfBirth)) console.log('Please enter a valid date');

  const q ="INSERT INTO nhanvien (email, password, HoVaTen, DiaChi, NgaySinh, SDT) VALUES (?)";

  db.query(q, [[ email, password, fullname, address, dateOfBirth, phoneNumber]] ,(err, result) => {
    if (err){
      throw err; 
    }
    res.redirect('/login');
  })
}

const getLogin = (req, res) => {
  res.render('auth/login.ejs', {
    pageTitle: 'Login',
    session: req.session
  });
}

const login = (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const query = 'SELECT MaNV, email, password FROM nhanvien where email = ?'

    db.query(query, [email], (err, user) => {
      if (user.length > 0 ){
        for (let i = 0; i < user.length; i++){
          if (user[i].password === password){
            req.session.user_id = user[i].MaNV;
            res.redirect('/');
          }
        }
      }
      else{
        res.send('Incorrect Email Address');
      }
    })
  }
}

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
}

const homePage = (req, res) => {
  const q = "SELECT * FROM mon";

  db.query(q, (err, dishTypes) => {
    if (err){
      next(err);
    }
    res.render("homepage.ejs", {
      session: req.session,
      pageTitle: 'Cafe Shop',
      dishTypes
    })
  })
};

const profile = (req, res) => {
  res.render("profile.ejs", {
    pageTitle: 'Profile',
    sesson: req.sesson
  });
};

const cartPage = (req, res) => {
  res.render("cart.ejs");
};

module.exports = {
  getSignup,
  signup,
  getLogin,
  login,
  logout,
  homePage,
  profile,
  cartPage,
};

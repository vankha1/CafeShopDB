const db = require('../config/db')

const dishPage = (req, res) => {

  const q = "SELECT Maloaimon, Ten, Loaimon FROM loaimon";

  db.query(q, (err, dishes) => {
    if (err){
      throw err;
    }
    const drinkDishes = dishes.filter(dish => dish.Loaimon === 'Nuoc uong');
    const anotherDishes = dishes.filter(dish => dish.Loaimon === 'Do an');

    res.render("dish.ejs", {
      pageTitle : 'Dish',
      isAuth: req.session.user_id,
      drinkDishes,
      anotherDishes
    });
  })

};

const addToCart = (req, res) => {

  const nameCustomer = req.body.nameCustomer;
  const addressCustomer = req.body.addressCustomer;

  const result = req.body.nameDish.map((dish, index) => {
    const sizes = ['M', 'L', 'XL'].filter(size => req.body['size' + size + (index + 1)] === 'on');
    return { dish, sizes };
  });

  const cart = {...result, nameCustomer, addressCustomer};

  const q = "INSERT INTO customers (name, address) VALUES (?)";
  const q1 = ""

  db.query()

  res.send('Add success');
}

const getAddDish = (req, res) => {
  res.render('crud/addDish.ejs', {
    pageTitle: 'Add dish'
  })
}

const addDish = (req, res) => {
  const { foodType, size, price } = req.body;

  const q1 = "SELECT count(*) as count FROM loaimon";

  db.query(q1, (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error executing query");
      return;
    }

    const count = result[0].count;

    if (foodType > count || foodType <= 0) {
      res.send("Please select a different food type");
      return;
    }

    const q2 = "INSERT INTO mon (Maloaimon, Kichco, Dongia) VALUES (?, ?, ?)";

    db.query(q2, [foodType, size, price], (err, result) => {
      if (err) {
        console.log(err);
        res.send("Error executing query");
        return;
      }

      res.redirect('/admin');
    });
  });
};

const getUpdateDish = (req, res) => {

  const id = req.params.id;
  let dish;

  

  const q = "SELECT * FROM mon"

  res.render('crud/addDish', {
    
  })
}

const updateDish = (req, res) => {

}


const deleteDish = (req, res) => {

}

module.exports = {
  dishPage,
  addToCart,
  getAddDish,
  addDish,
  getUpdateDish,
  updateDish,
  deleteDish
};

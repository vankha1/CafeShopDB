const express = require('express')

const dishController = require('../controller/dish.controller')

const router = express.Router();

router.get('/', dishController.dishPage); 

router.get('/admin/add', dishController.getAddDish);
router.post('/admin/add', dishController.addDish);

router.post('/add-to-cart', dishController.addToCart)

router.get('/admin/update/:id', dishController.getUpdateDish);
router.post('/admin/update/:id', dishController.updateDish);

module.exports = router;
const express = require('express')

const dishController = require('../controller/dish.controller')

const router = express.Router();

router.get('/', dishController.dishPage); 

module.exports = router;
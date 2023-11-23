const express = require('express')

const userController = require('../controller/user.controller')

const router = express.Router();

router.get('/', userController.homePage);
router.get('/profile', userController.profile);
router.get('/cart', userController.cartPage);

module.exports = router;
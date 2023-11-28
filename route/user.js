const express = require('express')

const userController = require('../controller/user.controller')

const router = express.Router();


router.get('/', userController.homePage);

router.get('/signup', userController.getSignup);
router.post('/signup', userController.signup);

router.get('/login', userController.getLogin);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.get('/profile', userController.profile);
router.post('/profile/update/:id', userController.updateProfile);

module.exports = router;
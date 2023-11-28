const express = require('express')

const cartController = require('../controller/cart.controller')

const router = express.Router();

router.get('/invoice', cartController.invoicePage);
router.post('/admin/add/:id', cartController.addCart);

// router.get('/admin/delete/:id', cartController.getDeleteCart);
// router.post('/admin/delete/:id', cartController.deleteCart);

module.exports = router;
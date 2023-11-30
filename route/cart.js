const express = require('express')

const cartController = require('../controller/cart.controller')

const router = express.Router();

router.get('/invoice', cartController.invoicePage);

router.get('/invoice/preview/:id', cartController.viewBeforeExport);

router.post('/invoice/export', cartController.invoiceExport)

// router.get('/admin/delete/:id', cartController.getDeleteCart);
// router.post('/admin/delete/:id', cartController.deleteCart);

module.exports = router;
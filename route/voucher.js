const express = require('express')

const voucherController = require('../controller/voucher.controller')

const router = express.Router();


router.get('/admin/add/:id', voucherController.getAddVoucher);
router.post('/admin/add/:id', voucherController.addVoucher);

router.get('/admin/delete/:id', voucherController.getDeleteVoucher);
router.post('/admin/delete/:id', voucherController.deleteVoucher);

module.exports = router;
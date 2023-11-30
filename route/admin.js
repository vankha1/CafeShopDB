const express = require('express')

const adminController = require('../controller/admin.controller')


const router = express.Router();

router.get('/' , adminController.adminPage);

router.get('/table', adminController.adminTablePage);
router.post('/table/detail', adminController.adminTableDetail);

router.get('/cart', adminController.adminCartPage);
router.get('/cart/view/:id', adminController.adminCartView)

router.get('/voucher', adminController.adminVoucherPage);

router.get('/staff', adminController.adminStaffPage);
router.post('/staff/delete/:id', adminController.deleteStaff);

module.exports = router;
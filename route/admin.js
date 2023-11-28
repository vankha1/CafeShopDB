const express = require('express')

const adminController = require('../controller/admin.controller')


const router = express.Router();

router.get('/' , adminController.adminPage);
router.get('/table', adminController.adminTablePage);
router.get('/cart', adminController.adminCartPage);
router.get('/voucher', adminController.adminVoucherPage);
router.get('/staff', adminController.adminStaffPage);
router.post('/staff/delete/:id', adminController.deleteStaff);

module.exports = router;
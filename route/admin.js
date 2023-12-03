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
router.get('/staff/update/:id', adminController.getUpdateStaff);
router.post('/staff/update/:id', adminController.updateStaff);
router.post('/staff/delete/:id', adminController.deleteStaff);
router.post('/staff', adminController.findInvoiceAndStaff);
router.get('/staff/sort', adminController.sortByName);
router.post('/staff/findByName', adminController.findByName);

module.exports = router;
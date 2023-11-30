const express = require('express')

const tableController = require('../controller/table.controller')

const router = express.Router();

router.get('/', tableController.tablePage);

router.post('/add-table-to-cart', tableController.addTableToCart);

module.exports = router;
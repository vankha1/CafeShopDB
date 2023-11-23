const express = require('express')

const tableController = require('../controller/table.controller')

const router = express.Router();

router.get('/', tableController.tablePage);

module.exports = router;
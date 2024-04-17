var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/fishingRods',require('./fishingRods'));
router.use('/authors',require('./authors'));
router.use('/users',require('./users'));
router.use('/auth',require('./auth'));
router.use('/items',require('./items'));
module.exports = router;

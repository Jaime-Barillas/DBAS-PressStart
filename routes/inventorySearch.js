var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('inventorysearch', { title: 'Press Start - Inventory Search' });
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('inventorySearchResults', { title: 'Press Start - Inventory Search Results' });
});

module.exports = router;

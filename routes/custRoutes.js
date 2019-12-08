var express = require('express');
var router = express.Router();

var customer_controller = require('../controller/customer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('CustomerPortal/index', { title: 'Press Start' });
});

router.get('/login', function(req, res, next) {
  res.render('CustomerPortal/login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('CustomerPortal/register', { title: 'Register' });
});

router.get('/reserve', function(req, res, next) {
  res.render('CustomerPortal/reserve', { title: 'Reserve' });
});

router.get('/individualInventory', function(req, res, next) {
  res.render('CustomerPortal/individualInventory', { title: 'Individual Inventory' });
});

module.exports = router;

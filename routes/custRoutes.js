var express = require('express');
var router = express.Router();

var customer_controller = require('../controller/customer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Press Start' });
});

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'Press Start' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/reserve', function(req, res, next) {
  res.render('reserve', { title: 'Reserve' });
});

router.get('/individualInventory', function(req, res, next) {
  res.render('individualInventory', { title: 'Individual Inventory' });
});


// router.get('/customers',customer_controller.search);


module.exports = router;
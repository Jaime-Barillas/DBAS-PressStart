
var express = require('express');
var router = express.Router();

var employee_controller = require('../controller/staff');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Staff Dashboard' });
});

/* GET dashboard page. */
router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Staff Dashboard' });
});

router.get('/inventorySearch', function(req, res, next) {
  res.render('inventorySearch', { title: 'Inventory' });
});

router.get('/inventorySearchResults', function(req, res, next) {
  res.render('inventorySearchResults', { title: 'Inventory Results' });
});

router.get('/individualInventory', function(req, res, next) {
  res.render('individualInventory', { title: 'Individual Inventory' });
});


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login Page' });
});


router.get('/tradein', function(req, res, next) {
  res.render('tradein', { title: 'Trade In' });
});


router.get('/tradeindetails', function(req, res, next) {
  res.render('tradeindetails', { title: 'Trade In Details' });
});


router.get('/repairSearch', function(req, res, next) {
  res.render('repairSearch', { title: 'Repair Search' });
});


router.get('/repairDetails', function(req, res, next) {
  res.render('repairDetails', { title: 'Repair Details' });
});


router.get('/repairSearchResults', function(req, res, next) {
  res.render('repairSearchResults', { title: 'Repair Search Results' });
});



router.get('/customerSearch', function(req, res, next) {
  res.render('customerSearch', { title: 'Customers Search' });
});

router.get('/', function(req, res, next) {
  res.render('customerSearchResults', { title: 'Customers Search Results' });
});


//Manager Routes


router.get('/manager', function(req, res, next) {
  res.render('manager', { title: 'Welcome Manager' });
});

//Routes for the sider bar news feed
router.get('/manager/managerupdateoffers', function(req, res, next) {
  res.render('managerOffers',{ title: 'Manager Offers' });
});

router.get('/manager/managercust', function(req, res, next) {
  res.render('managerCustomers',{ title: 'Manager Customers View' });
});


//router.get('/manager/managercustdetails', employee_controller.search);

router.get('/manager/payroll', function(req, res, next) {
  res.render('managerPayroll',{ title: 'Payroll' });
});

router.get('/manager/payroll/EmployeeEntry', function(req, res, next) {
  res.render('managerPayrollAddEmployee',{ title: 'Add Employee' });
});

//res.render('/manager/payroll/EmployeeDetail', employee_controller.search2);

router.get('/manager/reports', function(req, res, next) {
  res.render('reports',{ title: 'Reports' });
});


router.get('/manager/reportdetails', function(req, res, next) {
  res.send('detailedReport',{ title: 'Detailed Reports' });
});

module.exports = router;

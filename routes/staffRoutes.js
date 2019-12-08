var express = require('express');
var router = express.Router();

var employee_controller = require('../controller/staff');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('StaffPortal/dashboard', { title: 'Staff Dashboard' });
});

/* GET dashboard page. */
router.get('/dashboard', function(req, res, next) {
  res.render('StaffPortal/dashboard', { title: 'Staff Dashboard' });
});

router.get('/inventorySearch', function(req, res, next) {
  res.render('StaffPortal/inventorySearch', { title: 'Inventory' });
});

router.post('/inventorySearchResults', employee_controller.inventorySearchResults);

router.get('/individualInventory', function(req, res, next) {
  res.render('StaffPortal/individualInventory', { title: 'Individual Inventory' });
});

router.get('/login', function(req, res, next) {
  res.render('StaffPortal/login', { title: 'Login Page' });
});

router.get('/tradein', function(req, res, next) {
  res.render('StaffPortal/tradein', { title: 'Trade In' });
});

router.get('/tradeindetails', function(req, res, next) {
  res.render('StaffPortal/tradeindetails', { title: 'Trade In Details' });
});

router.get('/repairSearch', function(req, res, next) {
  res.render('StaffPortal/repairSearch', { title: 'Repair Search' });
});

router.get('/repairDetails', function(req, res, next) {
  res.render('StaffPortal/repairDetails', { title: 'Repair Details' });
});

router.get('/repairSearchResults', function(req, res, next) {
  res.render('StaffPortal/repairSearchResults', { title: 'Repair Search Results' });
});

router.get('/customerSearch', function(req, res, next) {
  res.render('StaffPortal/customerSearch', { title: 'Customers Search' });
});

router.get('/', function(req, res, next) {
  res.render('StaffPortal/customerSearchResults', { title: 'Customers Search Results' });
});


//Manager Routes


router.get('/manager', function(req, res, next) {
  res.render('StaffPortal/Manager/manager', { title: 'Welcome Manager' });
});

//Routes for the sider bar news feed
router.get('/manager/managerupdateoffers', function(req, res, next) {
  res.render('StaffPortal/Manager/managerOffers',{ title: 'Manager Offers' });
});

router.get('/manager/managercust', function(req, res, next) {
  res.render('StaffPortal/Manager/managerCustomers',{ title: 'Manager Customers View' });
});


//router.get('/manager/managercustdetails', employee_controller.search);

router.get('/manager/payroll', function(req, res, next) {
  res.render('StaffPortal/Manager/managerPayroll',{ title: 'Payroll' });
});

router.get('/manager/payroll/EmployeeEntry', function(req, res, next) {
  res.render('StaffPortal/Manager/managerPayrollAddEmployee',{ title: 'Add Employee' });
});

//res.render('/manager/payroll/EmployeeDetail', employee_controller.search2);

router.get('/manager/reports', function(req, res, next) {
  res.render('StaffPortal/Manager/reports',{ title: 'Reports' });
});

router.get('/manager/monthlyreport', function(req, res, next) {
  res.render('StaffPortal/Manager/monthlyreport',{ title: 'Reports' });
});

router.get('/manager/itemsalesreport', function(req, res, next) {
  res.render('StaffPortal/Manager/itemsalesreport',{ title: 'Reports' });
});

router.get('/manager/reportdetails', function(req, res, next) {
  res.send('StaffPortal/Manager/detailedReport',{ title: 'Detailed Reports' });
});

module.exports = router;

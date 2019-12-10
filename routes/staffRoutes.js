var express = require('express');
var router = express.Router();

var employee_controller = require('../controller/staff');
var site = 'Press Start'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('StaffPortal/dashboard', { title: site + ' | ' + 'Staff Dashboard' });
});

/* GET dashboard page. */
router.get('/dashboard', function(req, res, next) {
  res.render('StaffPortal/dashboard', { title: site + ' | ' + 'Staff Dashboard' });
});

router.get('/inventorySearch', function(req, res, next) {
  res.render('StaffPortal/inventorySearch', { title: site + ' | ' + 'Inventory' });
});

router.post('/inventorySearchResults', employee_controller.inventorySearchResults);

router.get('/individualInventory/:id', employee_controller.individualInventory);

router.get('/login', function(req, res, next) {
  res.render('StaffPortal/login', { title: site + ' | ' + 'Staff Login Page' });
});

router.get('/tradein', employee_controller.tradein);

router.get('/tradeindetails/:id', employee_controller.tradeindetails);

router.get('/repairSearch', function(req, res, next) {
  res.render('StaffPortal/repairSearch', { title: site + ' | ' + 'Repair Search' });
});

router.get('/repairDetails', function(req, res, next) {
  res.render('StaffPortal/repairDetails', { title: site + ' | ' + 'Repair Details' });
});

router.get('/repairSearchResults', function(req, res, next) {
  res.render('StaffPortal/repairSearchResults', { title: site + ' | ' + 'Repair Search Results' });
});

router.get('/customerSearch', function(req, res, next) {
  res.render('StaffPortal/customerSearch', { title: site + ' | ' + 'Customers Search' });
});

router.get('/', function(req, res, next) {
  res.render('StaffPortal/customerSearchResults', { title: site + ' | ' + 'Customers Search Results' });
});


//Manager Routes


router.get('/manager', function(req, res, next) {
  res.render('StaffPortal/Manager/manager', { title: site + ' | ' + 'Manager Home' });
});

router.post('/manager', function(req, res, next) {
  res.render('StaffPortal/Manager/manager', { title: site + ' | ' + 'Manager Home' });
});

//Routes for the sider bar news feed
router.get('/manager/managerupdateoffers', function(req, res, next) {
  res.render('StaffPortal/Manager/managerOffers',{ title: site + ' | ' + 'Manager Offers' });
});

router.post('/manager/managerupdateoffers/', employee_controller.updateOffers);

router.get('/manager/managercust', function(req, res, next) {
  res.render('StaffPortal/Manager/managerCustomers',{ title: site + ' | ' + 'Manager Customers View' });
});


//router.get('/manager/managercustdetails', employee_controller.search);

router.get('/manager/payroll', function(req, res, next) {
  res.render('StaffPortal/Manager/managerPayroll',{ title: site + ' | ' + 'Payroll' });
});

router.get('/manager/payroll/EmployeeEntry', function(req, res, next) {
  res.render('StaffPortal/Manager/managerPayrollAddEmployee',{ title: site + ' | ' + 'Add Employee' });
});

//res.render('/manager/payroll/EmployeeDetail', employee_controller.search2);

router.get('/manager/reports', function(req, res, next) {
  res.render('StaffPortal/Manager/reports',{ title: site + ' | ' + 'Reports' });
});

router.get('/manager/monthlyreport', employee_controller.monthlyReport);

router.get('/manager/itemsalesreport', employee_controller.itemSalesReport);

router.get('/manager/reportdetails', function(req, res, next) {
  res.send('StaffPortal/Manager/detailedReport',{ title: site + ' | ' + 'Detailed Reports' });
});

module.exports = router;

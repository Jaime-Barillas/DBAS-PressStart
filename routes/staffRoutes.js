var express = require('express');
var router = express.Router();

var employee_controller = require('../controller/staff');
var db = require('../db/api.js');
var site = 'Press Start'




/* GET home page. */
router.get('/', function(req, res) {
  res.render('StaffPortal/login', { title: site + ' | ' + 'Staff Login' });
});

router.post('/auth', function(req, res) {
	var username = req.body.userid;
  var password = req.body.password;
  console.log(username)
	if (username && password) {
    if (db.Authorization.employeeLogin(username, password).res.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      console.log('login success');
      res.redirect('./dashboard');
    } else {
      console.log('login fail');
      res.send('Incorrect Username and/or Password!');
    }			
    res.end();
	} else {
    console.log('login not sent');
    res.redirect('./');
		res.send('Please enter Username and Password!');
		res.end();
	}
});


// router.get('/', function(req, res, next) {
//   res.render('StaffPortal/dashboard', { title: site + ' | ' + 'Staff Dashboard' });
// });

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

router.get('/repairSearch', employee_controller.repairSearch);

router.get('/repairDetails/:id', employee_controller.repairDetails);

router.get('/repairSearchResults', function(req, res, next) {
  res.render('StaffPortal/repairSearchResults', { title: site + ' | ' + 'Repair Search Results' });
});

router.get('/customerSearch', employee_controller.customerSearch);

router.get('/customerUpdate/:id', employee_controller.customerUpdate);

router.post('/customerUpdate/:id', employee_controller.customerUpdate);


//Manager Routes

router.get('/manager/', employee_controller.readOffers);

// router.get('/manager', function(req, res, next) {
//   res.render('StaffPortal/Manager/manager', { title: site + ' | ' + 'Manager Home' });
// });

router.post('/manager', function(req, res, next) {
  res.render('StaffPortal/Manager/manager', { title: site + ' | ' + 'Manager Home' });
});

//Routes for the sider bar news feed
//router.get('/manager/managerupdateoffers', employee_controller.readOffers);
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

// router.get('/manager/payroll/EmployeeEntry', function(req, res, next) {
//   res.render('StaffPortal/Manager/managerPayrollAddEmployee',{ title: site + ' | ' + 'Add Employee' });
// });

router.get('/manager/payroll/EmployeeEntry', employee_controller.employeeAdd);
router.post('/manager/payroll/EmployeeEntry', employee_controller.employeeAdd);

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

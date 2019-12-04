var express = require('express');
var router = express.Router();

var db = require('../db/api.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Press Start' });
});

router.get('/monthlyreport', function(req, res, next) {
  let reportPromise = db.Reports.monthlyReport();
  reportPromise.then(data => {
      res.render('monthlyreport', {dat: data});
  });
});

router.get('/itemsalesreport', function(req, res, next) {
  let reportPromise = db.Reports.itemsReportData();
  reportPromise.then(data => {
      let reportData = data.slice(0, 6);
      res.render('itemsalesreport', {dat: reportData});
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();

var db = require('../db/api.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/monthlyreport', function(req, res, next) {
    let reportPromise = db.Reports.itemsReportData();
    reportPromise.then(data => {
        let reportData = data.slice(0, 6);
        res.render('index', {title: JSON.stringify(reportData)});
    });
});

module.exports = router;

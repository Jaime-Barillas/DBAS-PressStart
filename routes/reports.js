var express = require('express');
var router = express.Router();

// import reports model to be used and speak with the DB
var report = require('../models/reports')




//var reportQuery = require('../db/api');

// var reportObject = reportQuery(
//   {
//     item_name: 'blah',
//     total_sold: 'blah',
//     total_revenue: 'blah'
//   }
// );

// reportObject.err(function (err, addReport){
//   if (err) return console.error(err);
//   console.log('Report Created')
//   console.log(addReport)
// });



/* GET Reports page. */
router.get('/', function(req, res, next) {
  res.render('reports', { reports: 'Reports' });
});


// get all the reports in the DB
exports.getReports = function (req, res) {

  //search the db for projects using the model
  report.find({}).exec(function(error, reports){
      if (error) {
          console.log("Could not find any reports")
      } else {
          //if projects are returned render the pug template

          res.render('reports', {
              message: 'successful retrieve!',
              reports: reports
          });
      }
  })
};

module.exports = router;
var api = require('../db/api');

var Report = api.Reports;

// var monthlyReport = Report.monthlyReport();
// monthlyReport.then(items => console.log(items));

// // Virtual for schema URL
// monthlyReport
//   .virtual('url')
//   .get(function () {
//     console.log("Report line item")
//     return '/views/reports' + this._id;
//   });
  
// //Export model
// module.exports = api.Reports('MonthlyQuery', monthlyReport);
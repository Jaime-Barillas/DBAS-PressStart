var db = require('../db/api.js');

exports.search = function(req, res) {

// 	Customer.function(req, res, next) {
//   res.render('viewcustomers', {title: 'Hello Customer'});
// }
/*console.log(typeof(member.search))*/
db.Members.search({firstName: 'a'}).then(ans => res.render('viewcustomers', {title: ans[0].member_first_name}))
;



};

exports.getPaginated = function(req,res) {

	db.Inventory.getPaginated().then(inv => res.render('index', {title: inv}));

};





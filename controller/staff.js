var db = require('../db/api.js');


exports.inventorySearchResults = function(req, res) {
    let storeId = req.body.storeLocation;
    let name = req.body.itemName;
    db.Inventory.search({storeId: storeId, name: name})
      .then(items => {
          res.render('StaffPortal/inventorySearchResults',
                     {
                         title: 'Inventory Results',
                         items: items
                     });
      });
}




exports.search = function(req, res) {

// 	Customer.function(req, res, next) {
//   res.render('viewcustomers', {title: 'Hello Customer'});
// }
/*console.log(typeof(member.search))*/
db.Members.search({firstName: 'a'}).then(ans => res.render('viewcustomers', {title: ans[0].member_first_name}))
;




};

exports.search2 = function(req, res)
{

db.Employees.all().then(ans => res.render('viewemployees', {title: ans.map(guy => JSON.stringify(guy))}));

};



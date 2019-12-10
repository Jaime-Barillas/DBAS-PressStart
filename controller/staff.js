var db = require('../db/api.js');


exports.inventorySearchResults = function(req, res) {
    let storeId = req.body.storeLocation;
    let name = req.body.itemName;

    Promise.all([db.Inventory.search({storeId: storeId, name: name}),
                 db.Stores.all()])
           .then(([items, stores]) => {
               let storeAddress = stores.find(store => store.store_id == storeId);
               res.render('StaffPortal/inventorySearchResults',
                   {
                       title: 'Inventory Results',
                       items: items,
                       store: storeAddress
                   });
           });
}

exports.individualInventory = function(req, res) {
    db.Inventory.search({id: req.params.id})
      .then(items => {
          let item = items[0];

          db.Conditions.conditionForItem(item.item_id)
            .then(condition => res.render('StaffPortal/individualInventory',
                {
                    title: 'Individual Inventory',
                    item: item,
                    condition: condition
                }
            ));
      });
}

exports.tradein = function(req, res) {
    let result = db.Trades.all();

    result.then(trades => {
        res.render('StaffPortal/tradein', {
            title: 'Trade In',
            tradeIns: trades
        });
    });
}

exports.tradeindetails = function(req, res) {
    let result = db.Trades.lineItems(req.params.id);

    result.then(lineItems => {
        let total = lineItems.reduce(
            (total, item) => total + Number(item.trade_item_final_trade_value.toString().substr(1)),
            0
        );
        res.render('StaffPortal/tradeindetails', {
            title: 'Trade In Details',
            lineItems: lineItems,
            total: total
        });
    });
}

exports.monthlyReport = function(req, res) {
    db.Reports.monthlyReport()
      .then(report => res.render('StaffPortal/Manager/monthlyreport',
          {
              title: 'Reports',
              dat: report
          }
      ));
}

exports.itemSalesReport = function(req, res) {
    db.Reports.itemsReportData()
      .then(report => res.render('StaffPortal/Manager/itemsalesreport',
          {
              title: 'Reports',
              dat: report
          }));
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

/**
 * 
 */
exports.updateOffers = function(req, res)
{
    let title = req.body.offerupdatetitle
    let article = req.body.offerupdate
    let frontpage = req.body.frontPage

    db.Offers.updateOffer({title: title, article: article, frontpage: frontpage})
        .then(ans => res.render('StaffPortal/manager', {}));

};
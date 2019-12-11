var db = require('../db/api.js');


var site = 'Press Start';

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

exports.repairSearch = function(req, res) {
    db.Repairs.all()
      .then(repairs => res.render('StaffPortal/repairSearch',
          {
              title: site + ' | ' + 'Repair Search',
              repairs: repairs
          }
      ));
}

exports.repairDetails = function(req, res) {
    db.Repairs.search({id: req.params.id})
      .then(repairs => {
          let repair = repairs[0];
          db.Repairs.lineItems(repair.repair_id)
            .then(lineItems => res.render('StaffPortal/repairDetails',
              {
                  title: site + ' | ' + 'Repair Details',
                  repair: repair,
                  lineItems: lineItems
              }
            ));
      });
}

exports.customerSearch = function(req, res) {
    db.Members.all()
      .then(members => res.render('StaffPortal/customerSearch',
          {
              title: site + ' | ' + 'Member Search',
              members: members
          }
      ));
}

exports.customerUpdate = function(req, res) {
    if (req.method === 'GET') {
        let flashText = req.cookies.flash;
        res.clearCookie('flash');
        db.Members.search({id: req.params.id})
          .then(members => res.render('StaffPortal/customerUpdate',
              {
                  title: site + ' | ' + 'Customer Update',
                  member: members[0],
                  flash: flashText
              }
          ));
    } else if (req.method === 'POST') {
        db.Members.update(
            {
                id: req.params.id,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                mailingList: req.body.mailingList,
                phone: req.body.phone,
                postalCode: req.body.postalCode,
                prefferedStore: req.body.prefferedStore
            }
        ).then(member => {
            res.cookie('flash', 'Member Info Updated!')
            res.redirect(`../customerUpdate/${req.params.id}`)
        });
    }
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
    let title = req.body.title
    let article = req.body.article
    let frontpage = req.body.frontpage;

    db.Offers.updateOffer({title: title, article: article, frontpage: frontpage})
        .then(res.render('StaffPortal/Manager/manageroffers', {}))
};

/**
 * 
 */
exports.readOffers = function(req, res)
{
    db.Offers.readOffers()
        .then(offers => res.render('StaffPortal/Manager/manager', {
            title: site + ' | ' + 'Manager Home',
            offers: offers
        }))

};

exports.employeeAdd = function(req, res) {
    if (req.method === 'GET') {
        console.log('getting...')
        res.render('StaffPortal/Manager/managerPayrollAddEmployee', {});
    } else if (req.method === 'POST') {
        console.log('posting...')
        try {db.Employees.create(
            {
                password: req.body.pass,
                firstName: req.body.fname,
                lastName: req.body.lname,
                jobTitle: req.body.job,
                phone: req.body.phone,
                email: req.body.email,                
                address: req.body.address,
                postalCode: req.body.postal,
                availability: req.body.availability,
                wage: req.body.rate,
                manager: req.body.manager
            }
   
        ).then(employee => {
            res.redirect(`./employeeentry`)
        
        })
        .catch(_ => null);
        }
        catch(error){
            console.error(error);
        }
    }
}


const fs = require('fs');
const path = require('path');

const { Pool } = require('pg');

var pool;

/**
 * This module exports various objects which contain functions for interacting
 * with the Press Start database.
 *
 * @example
 * const db = require('../db/api.js');
 * db.initialize();
 * // Code interacting with the database...
 * db.terminate();
 *
 * // Each of the namespaces and their associated functions can be reached via
 * // their name, e.g.:
 * // Access inventory functions:
 * db.Inventory.getPaginated()
 *
 * // Access member functions:
 * db.Members.search()
 * // etc...
 *
 * // You can also destructure 'db' if you so choose:
 * const { Inventory, Members, etc } = db;
 *
 * @module db/api
 */

function createRepair(memberId, employeeId, statusId, repairInvoiceDescription, repairInvoiceLabourHours, repairInvoiceLabourCost) {
    const createInvoiceSql = `INSERT INTO tbl_repair_invoices(
                                  customer_id,
                                  employee_id,
                                  repair_status_id,
                                  repair_invoice_description,
                                  repair_invoice_labour_hours,
                                  repair_invoice_labour_hours_cost
                              ) VALUES($1, $2, $3, $4, $5, $6)
                                  RETURNING repair_invoice_id;`;

    return pool.query(createInvoiceSql, [memberId, employeeId, statusId, repairInvoiceDescription, repairInvoiceLabourHours, repairInvoiceLabourCost])
               .then(res => res.rows[0].repair_invoice_id);
}
function createRepairLineItem(repairInvoiceId, repairItemPartName, repairItemPartDescription, repairItemCost) {
    const createLineItemSql = `INSERT INTO tbl_repair_items(
                                   repair_invoice_id,
                                   repair_part_name,
                                   repair_item_part_description,
                                   repair_item_cost
                               ) VALUES($1, $2, $3, $4);`;

    return pool.query(createLineItemSql, [repairInvoiceId, repairItemPartName, repairItemPartDescription, repairItemCost])
               .then(res => res.rows);
}

function createSale(memberId, employeeId, storeId, saleInvoiceDate) {
    const createInvoiceSql = `INSERT INTO tbl_sale_invoices(
                                  member_id,
                                  employee_id,
                                  store_id,
                                  sale_invoice_date
                              ) VALUES($1, $2, $3, $4)
                                  RETURNING invoice_id;`;

    return pool.query(createInvoiceSql, [memberId, employeeId, storeId, saleInvoiceDate])
               .then(res => res.rows[0].invoice_id);
}
function createSaleLineItem(invoiceId, itemId, saleItemQuantity, saleItemPrice) {
    const createLineItemSql = `INSERT INTO tbl_sale_items(
                                   invoice_id,
                                   item_id,
                                   sale_item_quantity,
                                   sale_item_price
                               ) VALUES($1, $2, $3, $4);`;

    return pool.query(createLineItemSql, [invoiceId, itemId, saleItemQuantity, saleItemPrice])
               .then(res => res.rows);
}

function isSomeVal(val) {
    return (val !== null && val !== undefined);
}

/**
 * Initializes the connection pool to the database. Make sure you run this
 * once before interacting with the database!
 */
exports.initialize = function() {
    pool = new Pool({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
}

/**
 * Waits for all queries to complete and shuts down the connections to the
 * database. Make sure you call this once on shutdown!
 */
exports.terminate = function() {
    pool.end();
}

/**
 * A collection of functions for interacting with the Press Start sales.
 *
 * @namespace
 */
exports.Sales = {
    /**
     * Creates a new Sale order with the specified info.
     *
     * @param {Object} saleInvoice - Contains the required information for the new sale order.
     * @param {Number} saleInvoice.memberId - The member that made the sale, may be null.
     * @param {Number} saleInvoice.employeeId - The employee that made the sale.
     * @param {Number} saleInvoice.storeId - The store where the sale was made.
     * @param {String} saleInvoice.saleInvoiceDate - The day and time the sale was made.
     * @param {Object[]} saleLineItems - An array of objects with properties corresponding to tbl_sale_items columns
     * in camelCase, there is no need to provide the invoice id.
     *
     * @returns A Promise that contains true or false.
     *
     * @memberof module:db/api.Sales
     */
    create: function(saleInvoice, saleLineItems) {
        // TODO: Transactions.
        let invoiceId;
        let queries;

        // Invoice
        queries = createSale(saleInvoice.memberId,
                             saleInvoice.employeeId,
                             saleInvoice.storeId,
                             saleInvoice.saleInvoiceDate)
                  .then(res => {invoiceId = res; return res;});

        // Line Items
        for (item of saleLineItems) {
            let {itemID, saleItemQuantity, saleItemPrice} = item;

            queries = queries.then(() => createSaleLineItem(invoiceId, itemID, saleItemQuantity, saleItemPrice));
        }

        return queries.then(_ => true).catch(_ => false);
    },
}

/**
 * A collection of functions for interacting with the Press Start inventory.
 * Contains functions to retrieve inventory, search for specific inventory,
 * and update inventory.
 *
 * @namespace
 */
exports.Inventory = {
    /**
     * This functions retrieves inventory items in a manner optimal for
     * pagination. The page offset, as well as, the amount of items per page
     * can be provided.
     *
     * @summary Retrieves an array of inventory items from the Press Start
     * database.
     *
     * @param {Number} [page=1] - The page offset.
     * @param {Number} [pageLimit=1] - The number of items per page.
     *
     * @returns A Promise that contains an array of JS objects, one for each
     * item per page. May return a promise that contains an array with fewer
     * than 'pageLimit' items or an empty array if there are not enough items
     * to populate the requested page.
     *
     * @example
     * let promise = Inventory.getPaginated();      // Return the first page at 10 items per page.
     * @example
     * let promise = Inventory.getPaginated(4);     // Return the fourth page at 10 items per page.
     * @example
     * let promise = Inventory.getPaginated(4, 15); // Return the fourth page at 15 items per page.
     * @example
     * // Print the items when they have been retrieved from the db, also
     * // handle any potential errors.
     * promise.then(items => console.log(items))
     *        .catch(err => console.log(err));
     *
     * @memberof module:db/api.Inventory
     */
    getPaginated: function(page = 1, pageLimit = 10) {
        // TODO: Argument validation

        const paginateSql = ` SELECT * FROM tbl_items
                                  OFFSET $1
                                  LIMIT $2;`;
        // 'offset' determines how many records to drop from the query. It must
        // be a multiple of 'pageLimit' (and start at 0) to paginate the
        // results.
        const offset = (page - 1) * pageLimit;

        return pool.query(paginateSql, [offset, pageLimit])
                   .then(res => res.rows);
    },

    /**
     * This functions searches inventory items for any items that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the item <code>id</code>, <code>name</code>, and
     * <code>itemType</code>. It is an error to provide an empty object or an
     * object without at least one of the mentioned properties.
     * <br/><br/>
     * The <code>name</code> property is a case-insensitive pattern that needs
     * to only match part of the item name. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     *
     * @summary Searches for an item from the Press Start database.
     *
     * @param {Object} item - An object containing the id, name or type of the
     *     desired item (or any combination of the three!)
     * @param {Number} item.id - The id of the desired item.
     * @param {String} item.name - The name of the desired item.
     * @param {String} item.itemType - The item type of the desired item.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the item with id 5.
     * let item = Inventory.search({id: 5})[0];
     * @example
     * // Return all copies of the 'MegaMan Battle Network 6: Gregar' game.
     * let items = Inventory.search({name: 'MegaMan Battle Network 6: Gregar'});
     * @example
     * // Return all copies of the 'Call of Duty Classic' game for the PS3.
     * // ps3Game is a variable set elsewhere in code which contains the id
     * // for the item type corresponding to PS3 games.
     * let items = Inventory.search({name: 'Call of Duty Classic', itemType: ps3Game});
     * @example
     * // Return all copies of any 'Call of Duty' game for the PS3.
     * // ps3Game is a variable set elsewhere in code which contains the id
     * // for the item type corresponding to PS3 games.
     * let items = Inventory.search({name: 'Call of Duty', itemType: ps3Game}); // e.g. there is more than one 'Call of Duty'.
     *
     * @memberof module:db/api.Inventory
     */
    search: function({id, storeId, name, itemType}) {
        // TODO: Parameter validation.
        const searchByIdSql = `SELECT * FROM tbl_items
                                   WHERE item_id = $1;`;

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = 'SELECT * FROM tbl_items WHERE ';

            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['store_id', storeId],
                ['item_name', name],
                ['item_type_id', itemType]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of id, name, or itemType.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, storeId, name, or itemType');
            }

            // The meat of the function:

            // We know that if we reached this code, entries has at least one
            // value inside it. We only need to test for the second anh third one.
            // The first entry will be added to the where clause
            // but second entry must have an AND prepended.
            let [first, ...rest] = entries;

            if (first[0] == 'item_name') {
                searchSql += `${first[0]} ILIKE $1 || '%'`;
            } else {
                searchSql += `${first[0]} = $1`;
            }

            if (rest) {
                for (var i = 0; i < 2; i++) {
                    if (rest[i]){
                        let [field] = rest[i];

                        if (field === 'item_name') {
                            searchSql += ` AND ${field} ILIKE $${i + 2} || '%'`;
                        } else {
                            searchSql += ` AND ${field} = $${i + 2}`;
                        }
                    }
                }
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    },

    update: function() {
        // TODO: Write me.
    }
}

/**
 * A collection of functions for retrieving the condition of an item.
 *
 * @namespace
 */
exports.Conditions = {

    /**
     * This function returns all possible physical conditions.
     *
     * @returns An array of all physical conditions.
     *
     * @example
     * let promise = db.Conditions.allPhysical();
     * promise.then(all => console.log(all));
     *
     * @memberof module:db/api.Conditions
     */
    allPhysical: function() {
        return pool.query('SELECT * FROM tbl_physical_conditions;')
                   .then(res => res.rows);
    },

    /**
     * This function returns all possible box conditions.
     *
     * @returns An array of all box conditions.
     *
     * @example
     * let promise = db.Conditions.allBox();
     * promise.then(all => console.log(all));
     *
     * @memberof module:db/api.Conditions
     */
    allBox: function() {
        return pool.query('SELECT * FROM tbl_box_conditions;')
                   .then(res => res.rows);
    },

    /**
     * This function returns all possible manual conditions.
     *
     * @returns An array of all manual conditions.
     *
     * @example
     * let promise = db.Conditions.allManual();
     * promise.then(all => console.log(all));
     *
     * @memberof module:db/api.Conditions
     */
    allManual: function() {
        return pool.query('SELECT * FROM tbl_manual_conditions;')
                   .then(res => res.rows);
    },

    /**
     * This function returns the conditions of an item in a JS object with the
     * format:
     * <br/><br/>
     * <pre><code>
     * {                           
     *     physicalCondition: blah,
     *     boxCondition: blah,
     *     manualCondition: blah
     * }                           
     * </code></pre>
     * <br/><br/>
     *
     * @returns An array of all manual conditions.
     *
     * @example
     * let promise = db.Conditions.conditionForItem(5);
     * promise.then(all => console.log(all));
     *
     * @memberof module:db/api.Conditions
     */
    conditionForItem: function(id) {
        let conditionSql = `SELECT physical_condition_id,
                                   box_condition_id,
                                   manual_condition_id
                            FROM tbl_conditions
                            JOIN tbl_items
                            ON tbl_conditions.condition_id = tbl_items.condition_id
                            WHERE tbl_items.item_id = $1;`;

        let result = Promise.all([
            pool.query(conditionSql, [id]).then(res => res.rows[0]),
            exports.Conditions.allPhysical(),
            exports.Conditions.allBox(),
            exports.Conditions.allManual()
        ]);

        result = result.then(([condition, physicalConditions, boxConditions, manualConditions]) => {
            let pcondition = physicalConditions.find(con => con.physical_condition_id == condition.physical_condition_id);
            let bcondition = boxConditions.find(con => con.box_condition_id == condition.box_condition_id);
            let mcondition = manualConditions.find(con => con.manual_condition_id == condition.manual_condition_id);

            return {
                physicalCondition: pcondition.physical_condition_name,
                boxCondition: bcondition.box_condition_name,
                manualCondition: mcondition.manual_condition_name
            };
        });

        return result;
    }
}

/**
 * A collection of functions for interacting with the Press Start inventory.
 * Contains functions to retrieve inventory, search for specific inventory,
 * and update inventory.
 *
 * @namespace
 */
exports.Repairs = {

    /**
     * This function returns the id and description of all repairs.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre>
     * <code style="display: inline-block;">
     * {
     *     repair_invoice_id: blah,
     *     repair_invoice_description: blah,
     *     repair_member_name: blah
     * }
     * </code></pre>
     *
     * @returns An array of all Press Start repairs.
     *
     * @example
     * let promise = db.Repairs.all();
     * promise.then(allRepairs => console.log(allRepairs));
     *
     * @memberof module:db/api.Repairs
     */
    all: function() {
        return pool.query(`SELECT repair_invoice_id,
                                  repair_invoice_description,
                                  (member_first_name || ' ' || member_last_name) As repair_member_name
                           FROM tbl_repair_invoices
                           JOIN tbl_members
                           ON tbl_repair_invoices.member_id = tbl_members.member_id
                           ORDER BY tbl_repair_invoices.repair_invoice_id DESC;`)
                   .then(res => res.rows);
    },

    /**
     * Creates a new Repair order with the specified info.
     *
     * @param {Object} repairInvoice - Contains the required information for the new repair order.
     * @param {Number} repairInvoice.memberId - The member that requested a repair.
     * @param {Number} repairInvoice.employeeId - The employee handling the repair.
     * @param {Number} repairInvoice.statusId - The status of the repair, should be 'open'.
     * @param {String} repairInvoice.repairInvoiceDescription - Description of the repair.
     * @param {Number} repairInvoice.repairInvoiceLabourHours - Amount of hours expected to take or 0 if updating later.
     * @param {Number} repairInvoice.repairInvoiceLabourCost - Hourly cost.
     * @param {Object[]} repairLineItems - An array of objects with properties corresponding to tbl_repair_items columns
     * in camelCase, there is no need to provide the invoice id.
     *
     * @returns A Promise that contains true or false.
     *
     * @memberof module:db/api.Repairs
     */
    create: function(repairInvoice, repairLineItems) {
        // TODO: Transactions.
        let invoiceId;
        let queries;

        // Invoice
        queries = createRepair(repairInvoice.memberId,
                               repairInvoice.employeeId,
                               repairInvoice.statusId,
                               repairInvoice.repairInvoiceDescription,
                               repairInvoice.repairInvoiceLabourHours,
                               repairInvoice.repairInvoiceLabourCost)
                  .then(res => {invoiceId = res; return res;});

        // Line Items
        for (item of repairLineItems) {
            let {repairItemPartName, repairItemPartDescription, repairItemCost} = item;

            queries = queries.then(() => createRepairLineItem(invoiceId, repairItemPartName, repairItemPartDescription, repairItemCost));
        }

        return queries.then(_ => true).catch(_ => false);
    },

    /**
     * This functions searches repairs for any records that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the repair invoice <code>id</code>, <code>memberFirstName</code>,
     * or <code>memberLastName</code>. It is an error to
     * provide an empty object or an object without at least one of the
     * mentioned properties.
     * <br/><br/>
     * The <code>memberFirstName</code> and <code>memberLastName</code>
     * properties are case-insensitive patterns that need to only match part
     * of their respective attributes. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre><code> // Format:
     * {
     *     repair_id: blah,
     *     repair_description: blah,
     *     repair_member_name: blah,
     *     repair_employee_name: blah,
     *     repair_status: blah
     * }
     * </code></pre>
     *
     * @summary Searches for repair order from the Press Start database.
     *
     * @param {Object} repairDetails - An object containing the repair invoice
     *     id, memberFirstName or memberLastName of the desired repair order
     *     (or any combination of the three!)
     * @param {Number} repairDetails.id - The id of the desired repair invoice.
     * @param {String} repairDetails.memberFirstName - The first name of the repair's member.
     * @param {String} repairDetails.memberLastName - The last name of the repair's member.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the repair order with id 5.
     * let promise = Repairs.search({id: 5});
     * @example
     * // Return all repairs with an associated member with a first name that starts with 'al'.
     * let promise = Repairs.search({firstName: 'al'}); // e.g. member with first name: alphonse
     * @example
     * // Return all repairs with an associated member whose first name starts with 'al' and last name
     * // starts with 'do'.
     * let promise = Repairs.search({firstName: 'al', lastName: 'do'}); // e.g. member: alphonse, dosomething
     *
     * @memberof module:db/api.Repairs
     */
    search: function({id, memberFirstName, memberLastName}) {
        // TODO: Parameter validation.
        const searchByIdSql = fs.readFileSync(path.resolve(__dirname, 'queries/repairs_search_by_id.sql'), 'utf8');

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = fs.readFileSync(path.resolve(__dirname, 'queries/repairs_search_by_name.sql'), 'utf8');
            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['tbl_members.member_first_name', memberFirstName],
                ['tbl_members.member_last_name', memberLastName]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of memberFirstName, or memberLastName.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, memberFirstName, or memberLastName');
            }

            // The meat of the function:

            // The first entry will be added to the where clause
            // but all subsequent entries must have an AND prepended.
            let [first, ...rest] = entries;

            searchSql += `${first[0]} ILIKE $1 || '%'`;
            for (var i = 0; i < rest.length; i++) {
                searchSql += ` AND ${rest[i][0]} ILIKE $${i + 2} || '%'`;
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    },

    /**
     * This functions retrieves the contents of the tbl_repair_items table for
     * a specific repair invoice.
     *
     * @summary Retrieves the line items for a repair invoice.
     *
     * @param {Number} id - The id of the invoice for which you want the line items of.
     *
     * @returns An array of line items, empty if no items were found.
     * @throws Error If none of the id was not provided.
     *
     * @example
     * let promise = Repairs.lineItems(1);
     * promise.then(lineItems => console.log(lineItems));
     *
     * @memberof module:db/api.Repairs
     */
    lineItems(id) {
        if (id === null || id === undefined || id < 1) {
            throw new Error('Must specify an id (greater than 0)!');
        }

        return pool.query('SELECT * FROM tbl_repair_items WHERE repair_invoice_id = $1', [id])
                   .then(res => res.rows);
    }
}

/**
 * A collection of functions for interacting with Press Start trade ins.
 *
 * @namespace
 */
exports.Trades = {

    /**
     * This function returns the id and date of all trades.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre><code> // Format:
     * {
     *     trade_invoice_id: blah,
     *     member_first_name: blah,
     *     member_last_name: blah,
     *     trade_invoice_date: blah
     * }
     * </code></pre>
     *
     * @returns An array of all Press Start trade ins.
     *
     * @example
     * let promise = db.Trades.all();
     * promise.then(allTrades => console.log(allTrades));
     *
     * @memberof module:db/api.Trades
     */
    all: function() {
        let allSql = `SELECT tbl_trade_invoices.trade_invoice_id,
                             tbl_members.member_last_name,
                             tbl_members.member_first_name,
                             tbl_trade_invoices.trade_invoice_date
                      FROM tbl_trade_invoices
                      JOIN tbl_members
                      ON tbl_trade_invoices.member_id = tbl_members.member_id
                      ORDER BY tbl_trade_invoices.trade_invoice_date desc;`;

        return pool.query(allSql)
                   .then(res => res.rows);
    },

    /**
     * This functions searches trade ins for any records that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the trade invoice <code>id</code>, <code>memberFirstName</code>,
     * or <code>memberLastName</code>. It is an error to
     * provide an empty object or an object without at least one of the
     * mentioned properties.
     * <br/><br/>
     * The <code>memberFirstName</code> and <code>memberLastName</code>
     * properties are case-insensitive patterns that need to only match part
     * of their respective attributes. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre><code> // Format:
     * {
     *     trade_id: blah,
     *     trade_date: blah,
     *     trade_member_name: blah
     * }
     * </code></pre>
     *
     * @summary Searches for trade-ins from the Press Start database.
     *
     * @param {Object} tradeDetails - An object containing the trade invoice
     *     id, memberFirstName or memberLastName of the desired trade order
     *     (or any combination of the three!)
     * @param {Number} tradeDetails.id - The id of the desired trade invoice.
     * @param {String} tradeDetails.memberFirstName - The first name of the trade's member.
     * @param {String} tradeDetails.memberLastName - The last name of the trade's member.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the Trade with id 5.
     * let promise = Trades.search({id: 5});
     * @example
     * // Return all Trades with an associated member with a first name that starts with 'al'.
     * let promise = Trades.search({firstName: 'al'}); // e.g. member with first name: alphonse
     * @example
     * // Return all Trades with an associated member whose first name starts with 'al' and last name
     * // starts with 'do'.
     * let promise = Trades.search({firstName: 'al', lastName: 'do'}); // e.g. member: alphonse, dosomething
     *
     * @memberof module:db/api.Trades
     */
    search: function({id, memberFirstName, memberLastName}) {
        // TODO: Parameter validation.
        const searchByIdSql = fs.readFileSync(path.resolve(__dirname, 'queries/trades_search_by_id.sql'), 'utf8');

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = fs.readFileSync(path.resolve(__dirname, 'queries/trades_search_by_name.sql'), 'utf8');
            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['tbl_members.member_first_name', memberFirstName],
                ['tbl_members.member_last_name', memberLastName]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of memberFirstName, or memberLastName.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, memberFirstName, or memberLastName');
            }

            // The meat of the function:

            // The first entry will be added to the where clause
            // but all subsequent entries must have an AND prepended.
            let [first, ...rest] = entries;

            searchSql += `${first[0]} ILIKE $1 || '%'`;
            for (var i = 0; i < rest.length; i++) {
                searchSql += ` AND ${rest[i][0]} ILIKE $${i + 2} || '%'`;
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    },

    /**
     * This functions retrieves the contents of the tbl_trade_items table for
     * a specific trade invoice. Returns an array of JS objects with properties
     * for  `item_id`, `item_name`, `trade_item_payout`,  `trade_item_final_trade_value`.
     *
     * @summary Retrieves the line items for a trade invoice.
     *
     * @param {Number} id - The id of the invoice for which you want the line items of.
     *
     * @returns An array of line items, empty if no items were found.
     * @throws Error If the id was not provided.
     *
     * @example
     * let promise = Trades.lineItems(1);
     * promise.then(lineItems => console.log(lineItems));
     *
     * @memberof module:db/api.Trades
     */
    lineItems: function(id) {
        if (id === null || id === undefined || id < 1) {
            throw new Error('Must specify an id (greater than 0)!');
        }

        return pool.query(`SELECT tbl_trade_items.trade_item_payout_type,
                                  tbl_trade_items.trade_item_final_trade_value,
                                  tbl_items.item_id,
                                  tbl_items.item_name
                           FROM tbl_trade_items
                           JOIN tbl_items
                           ON tbl_trade_items.item_id = tbl_items.item_id
                           WHERE trade_invoice_id = $1`,
                          [id])
                   .then(res => res.rows);
    }
}

/**
 * A collection of functions for interacting with Press Start reservations.
 *
 * @namespace
 */
exports.Reservations = {

    /**
     * This function returns the id, store id, and date reserved of all reservations.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre><code> // Format:
     * {
     *     reservation_id: blah,
     *     store_id: blah,
     *     reservation_date_reserved: blah
     * }
     * </code></pre>
     *
     * @returns An array of all Press Start reservations.
     *
     * @example
     * let promise = db.Reservations.all();
     * promise.then(allReservations => console.log(allReservations));
     *
     * @memberof module:db/api.Reservations
     */
    all: function() {
        return pool.query('SELECT reservation_id, store_id, reservation_date_reserved FROM tbl_reservations;')
                   .then(res => res.rows);
    },

    /**
     * This functions searches trade ins for any records that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the trade invoice <code>id</code>, <code>memberFirstName</code>,
     * or <code>memberLastName</code>. It is an error to
     * provide an empty object or an object without at least one of the
     * mentioned properties.
     * <br/><br/>
     * The <code>memberFirstName</code> and <code>memberLastName</code>
     * properties are case-insensitive patterns that need to only match part
     * of their respective attributes. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     * The returned data is an array with objects of the format:
     * <br/><br/>
     * <pre><code> // Format:
     * {
     *     reservation_id: blah,
     *     reservation_member_name: blah,
     *     reservation_date_reserved: blah,
     *     reservation_received: blah,
     *     store_id: blah
     * }
     * </code></pre>
     *
     * @summary Searches for reservations from the Press Start database.
     *
     * @param {Object} reservationDetails - An object containing the reservation
     *     id, memberFirstName or memberLastName
     *     (or any combination of the three!)
     * @param {Number} reservationDetails.id - The id of the desired reservation.
     * @param {String} reservationDetails.memberFirstName - The first name of the reservation's member.
     * @param {String} reservationDetails.memberLastName - The last name of the reservation's member.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the Reservation with id 5.
     * let promise = Reservations.search({id: 5});
     * @example
     * // Return all Reservations with an associated member with a first name that starts with 'al'.
     * let promise = Reservations.search({firstName: 'al'}); // e.g. member with first name: alphonse
     * @example
     * // Return all Reservations with an associated member whose first name starts with 'al' and last name
     * // starts with 'do'.
     * let promise = Reservations.search({firstName: 'al', lastName: 'do'}); // e.g. member: alphonse, dosomething
     *
     * @memberof module:db/api.Reservations
     */
    search: function({id, memberFirstName, memberLastName}) {
        // TODO: Parameter validation.
        const searchByIdSql = fs.readFileSync(path.resolve(__dirname, 'queries/reservations_search_by_id.sql'), 'utf8');

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = fs.readFileSync(path.resolve(__dirname, 'queries/reservations_search_by_name.sql'), 'utf8');
            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['tbl_members.member_first_name', memberFirstName],
                ['tbl_members.member_last_name', memberLastName]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of memberFirstName, or memberLastName.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, memberFirstName, or memberLastName');
            }

            // The meat of the function:

            // The first entry will be added to the where clause
            // but all subsequent entries must have an AND prepended.
            let [first, ...rest] = entries;

            searchSql += `${first[0]} ILIKE $1 || '%'`;
            for (var i = 0; i < rest.length; i++) {
                searchSql += ` AND ${rest[i][0]} ILIKE $${i + 2} || '%'`;
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    },

    /**
     * This functions retrieves the contents of the tbl_reservation_items table for
     * a specific reservation.
     *
     * @summary Retrieves the line items for a reservation.
     *
     * @param {Number} id - The id of the reservation for which you want the line items of.
     *
     * @returns An array of line items, empty if no items were found.
     * @throws Error If the id was not provided.
     *
     * @example
     * let promise = Reservations.lineItems(1);
     * promise.then(lineItems => console.log(lineItems));
     *
     * @memberof module:db/api.Reservations
     */
    lineItems: function(id) {
        if (id === null || id === undefined || id < 1) {
            throw new Error('Must specify an id (greater than 0)!');
        }

        return pool.query('SELECT * FROM tbl_reservation_items WHERE reservation_id = $1', [id])
                   .then(res => res.rows);
    }
}

/**
 * A collection of functions for interacting with Press Start member accounts.
 * Contains functions to create and search members.
 *
 * @namespace
 */
exports.Members = {
    /**
     * Creates a new member with the specified info.
     *
     * @param {Object} memberData - Contains the required information for the new member.
     * @param {String} memberData.email - The new member's email address.
     * @param {String} memberData.password - The new member's password.
     * @param {String} memberData.firstName - The new member's given name.
     * @param {String} memberData.lastName - The new member's surname.
     * @param {String} memberData.postalCode - The new member's postal code.
     * @param {String} memberData.phone - The new member's phone number.
     * @param {Boolean} memberData.mailingList - Whether the new member wishes to receive news letters.
     * @param {integer} memberData.prefferedStore - Id for the new member's preffered store.
     *
     * @returns A Promise that contains a JS object representing the newly
     * created member. If creation of the new member failed, <code>null</code>
     * is returned.
     *
     * @memberof module:db/api.Members
     */
    create: function({email, password, firstName, lastName, postalCode, phone, mailingList, prefferedStore}) {
        // TODO: Parameter validation.
        const createSql = `INSERT INTO tbl_members(
                               member_email,
                               member_password,
                               member_first_name,
                               member_last_name,
                               member_postal_code,
                               member_phone,
                               member_mailing_list,
                               member_preffered_store
                           ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                               RETURNING *;`;

        return pool.query(createSql, [email, password, firstName, lastName,
                                      postalCode, phone, mailingList,
                                      prefferedStore])
                   .then(res => res.rows[0])
                   .catch(_ => null);
    },

    /**
     * Updates a member with the specified info.
     *
     * @param {Object} memberData - Contains the required information for the new member.
     * @param {String} memberData.id - The member's id.
     * @param {String} memberData.email - The new member's email address.
     * @param {String} memberData.firstName - The new member's given name.
     * @param {String} memberData.lastName - The new member's surname.
     * @param {String} memberData.postalCode - The new member's postal code.
     * @param {String} memberData.phone - The new member's phone number.
     * @param {Boolean} memberData.mailingList - Whether the new member wishes to receive news letters.
     * @param {integer} memberData.prefferedStore - Id for the new member's preffered store.
     *
     * @returns A Promise that contains a JS object representing the newly
     * updated member. If creation of the new member failed, <code>null</code>
     * is returned.
     *
     * @memberof module:db/api.Members
     */
    update: function({id, email, firstName, lastName, postalCode, phone, mailingList, prefferedStore}) {
        // TODO: Parameter validation.
        const updateSql = `UPDATE tbl_members
                           SET member_first_name = $1,
                               member_last_name = $2,
                               member_email = $3,
                               member_mailing_list = $4,
                               member_phone = $5,
                               member_postal_code = $6,
                               member_preffered_store = $7
                           WHERE member_id = $8
                           RETURNING *`;

        return pool.query(updateSql, [firstName, lastName, email,
                                      mailingList, phone, postalCode,
                                      prefferedStore, id])
                   .then(res => res.rows[0])
                   .catch(_ => null);
    },

    /**
     * This function returns all members from the Press Start database.
     *
     * @returns An array of all Press Start members.
     *
     * @example
     * // Log all members to the console. It might take a while...
     * let promise = db.Members.all();
     * promise.then(allMems => console.log(allMems));
     *
     * @memberof module:db/api.Members
     */
    all: function() {
        return pool.query('SELECT * from tbl_members ORDER BY member_id ASC;')
                   .then(res => res.rows);
    },

    /**
     * This functions searches members for any records that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the member <code>id</code>, <code>email</code>,
     * <code>firstName</code>, or <code>lastName</code>. It is an error to
     * provide an empty object or an object without at least one of the
     * mentioned properties.
     * <br/><br/>
     * The <code>email</code>, <code>firstName</code>, and <code>lastName</code>
     * properties are case-insensitive patterns that need to only match part
     * of their respective attributes. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     *
     * @summary Searches for a member from the Press Start database.
     *
     * @param {Object} member - An object containing the id, email, firstName
     *     or lastName of the desired member (or any combination of the four!)
     * @param {Number} member.id - The id of the desired member.
     * @param {String} member.email - The email of the desired member.
     * @param {String} member.firstName - The first name of the desired member.
     * @param {String} member.lastName - The last name of the desired member.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the member with id 5.
     * let promise = Member.search({id: 5});
     * @example
     * // Return all members with a first name that starts with 'al'.
     * let promise = Member.search({firstName: 'al'}); // e.g. member with first name: alphonse
     * @example
     * // Return all Members whose first name starts with 'al' and last name
     * // starts with 'do'.
     * let promise = Member.search({firstName: 'al', lastName: 'do'}); // e.g. member: alphonse, dosomething
     *
     * @memberof module:db/api.Members
     */
    search: function({id, email, firstName, lastName}) {
        // TODO: Parameter validation.
        const searchByIdSql = `SELECT * FROM tbl_members
                                   WHERE member_id = $1;`;

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = 'SELECT * FROM tbl_members WHERE ';

            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['member_email', email],
                ['member_first_name', firstName],
                ['member_last_name', lastName]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of email, firstName, or lastName.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, email, firstName, or lastName');
            }

            // The meat of the function:

            // The first entry will be added to the where clause
            // but all subsequent entries must have an AND prepended.
            let [first, ...rest] = entries;

            searchSql += `${first[0]} ILIKE $1 || '%'`;
            for (var i = 0; i < rest.length; i++) {
                searchSql += ` AND ${rest[i][0]} ILIKE $${i + 2} || '%'`;
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    }
}

/**
 * A collection of functions for interacting with Press Start employee accounts.
 * Contains functions to create and search employees.
 *
 * @namespace
 */
exports.Employees = {
    /**
     * Creates a new employee with the specified info.
     *
     * @param {Object} employeeData - Contains the required information for the new employee.
     * @param {String} employeeData.email - The new employee's email address.
     * @param {String} employeeData.password - The new employee's password.
     * @param {String} employeeData.firstName - The new employee's given name.
     * @param {String} employeeData.lastName - The new employee's surname.
     * @param {String} employeeData.jobTitle - The new employee's job title.
     * @param {String} employeeData.postalCode - The new employee's postal code.
     * @param {String} employeeData.address - The new employee's address.
     * @param {String} employeeData.phone - The new employee's phone number.
     * @param {String} employeeData.availability - The days the employee can work.
     * @param {Number} employeeData.wage - The new employee's wage.
     *
     * @returns A Promise that contains a JS object representing the newly
     * created employee. If creation of the new employee failed, <code>null</code>
     * is returned.
     *
     * @memberof module:db/api.Employees
     */
    create: function({email, password, firstName, lastName, jobTitle, postalCode, address, phone, availability, wage}) {
        // TODO: Parameter validation.
        const createSql = `INSERT INTO tbl_employees(
                               employee_email,
                               employee_password,
                               employee_first_name,
                               employee_last_name,
                               employee_job_title,
                               employee_postal_code,
                               employee_address,
                               employee_phone,
                               employee_availability,
                               employee_wage
                           ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                               RETURNING *;`;

        return pool.query(createSql, [email, password, firstName, lastName,
                                      jobTitle, postalCode, address, phone,
                                      availability, wage])
                   .then(res => res.rows[0])
                   .catch(_ => null);
    },

    /**
     * This function returns all employees from the Press Start database.
     *
     * @returns An array of all Press Start employees.
     *
     * @example
     * // Log all employees to the console. It might take a while...
     * let promise = db.Employees.all();
     * promise.then(allEmps => console.log(allEmps));
     *
     * @memberof module:db/api.Employees
     */
    all: function() {
        return pool.query('SELECT * from tbl_employees;')
                   .then(res => res.rows);
    },

    /**
     * This functions searches employees for any records that match the
     * provided contstraints. Constraints are defined as a JS object with
     * properties for the employee <code>id</code>, <code>email</code>,
     * <code>firstName</code>, or <code>lastName</code>. It is an error to
     * provide an empty object or an object without at least one of the
     * mentioned properties.
     * <br/><br/>
     * The <code>email</code>, <code>firstName</code>, and <code>lastName</code>
     * properties are case-insensitive patterns that need to only match part
     * of their respective attributes. See examples for more info.
     * <br/><br/>
     * Only one of the properties is required, but if multiple are present,
     * then they will act as filters resulting in more specific results. Of
     * course, if the <code>id</code> property is present, then it will
     * supersede the other properties and return the item it directly
     * corresponds to.
     *
     * @summary Searches for an employee from the Press Start database.
     *
     * @param {Object} employee - An object containing the id, email, firstName
     *     or lastName of the desired employee (or any combination of the four!)
     * @param {Number} employee.id - The id of the desired employee.
     * @param {String} employee.email - The email of the desired employee.
     * @param {String} employee.firstName - The first name of the desired employee.
     * @param {String} employee.lastName - The last name of the desired employee.
     *
     * @returns An array of matching items, empty if no items were found.
     * @throws Error If none of the mentioned properties were present in the
     *     passed in object.
     *
     * @example
     * // Return the employee with id 5.
     * let promise = Employees.search({id: 5});
     * @example
     * // Return all employee with a first name that starts with 'al'.
     * let promise = Employees.search({firstName: 'al'}); // e.g. employee with first name: alphonse
     * @example
     * // Return all Employeess whose first name starts with 'al' and last name
     * // starts with 'do'.
     * let promise = Employees.search({firstName: 'al', lastName: 'do'}); // e.g. employee: alphonse, dosomething
     *
     * @memberof module:db/api.Employees
     */
    search: function({id, email, firstName, lastName}) {
        // TODO: Parameter validation.
        const searchByIdSql = `SELECT * FROM tbl_employees
                                   WHERE employee_id = $1;`;

        let result;

        if (id) {
            result = pool.query(searchByIdSql, [id]);
        } else {
            // Each constraint will be appended to this sql.
            let searchSql = 'SELECT * FROM tbl_employees WHERE ';

            // Filter out any null or undefined values.
            // These entries provide an ordered mapping from column name to
            // the search pattern.
            let entries = [
                ['employee_email', email],
                ['employee_first_name', firstName],
                ['employee_last_name', lastName]
            ].filter(([_, value]) => isSomeVal(value));

            // We must have at least one of email, firstName, or lastName.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, email, firstName, or lastName');
            }

            // The meat of the function:

            // The first entry will be added to the where clause
            // but all subsequent entries must have an AND prepended.
            let [first, ...rest] = entries;

            searchSql += `${first[0]} ILIKE $1 || '%'`;
            for (var i = 0; i < rest.length; i++) {
                searchSql += ` AND ${rest[i][0]} ILIKE $${i + 2} || '%'`;
            }
            searchSql += ';';

            result = pool.query(searchSql, entries.map(entry => entry[1]));
        }

        return result.then(res => res.rows);
    }
}

/**
 * A collection of functions for retrieving store info.
 *
 * @namespace
 */
exports.Stores = {
    /**
     * This function returns all Press Start stores.
     *
     * @returns An array of all Press Start stores.
     *
     * @example
     * // Log all stores to the console.
     * let promise = db.Stores.all();
     * promise.then(allStores => console.log(allStores));
     *
     * @memberof module:db/api.Stores
     */
    all: function() {
        return pool.query('SELECT * from tbl_stores;')
                   .then(res => res.rows);
    }
}

/**
 * A collection of functions for retrieving data to generate reports.
 *
 * @namespace
 */
exports.Reports = {
    /**
     * This functions retrieves report data for <em>each</em> item sale.
     * In other words, each sale to a customer has its own entry in the
     * returned data. The returned data is an array with objects of the format:
     * <br/><br/>
     * <code>
     * <pre>{                              
     *     item_report_name: blah,    
     *     item_report_quantity: blah,
     *     item_report_price: blah,   
     *     store_id: blah,            
     *     item_report_date: blah,    
     *     item_id: blah,             
     * }                              
     * </pre>
     * </code>
     *
     * @summary Retrieves sale data about items. You probably
     * <strong>don't</strong> want to use this function directly.
     *
     * @returns An array of JavaScript objects containing the item name, sale
     * quantity, sale price, store id, and sale date.
     *
     * @example
     * let promise = Reports.itemsReportData();
     * promise.then(items => console.log(items));
     *
     * @memberof module:db/api.Reports
     */
    itemsReportData: function() {
        const getAllSql = 'SELECT * FROM items_report ORDER BY item_report_date desc;';

        return pool.query(getAllSql)
                   .then(res => res.rows);
    },

    /**
     * This functions retrieves report data the last month of sales. The
     * returned data is an array that contains objects of the format:
     * <br/>
     * <code>
     * {
     *     item_name: blah,
     *     total_sold: blah,
     *     total_revenue: blah
     * }
     * </code>
     *
     * @summary Retrieves sale data about items for the last month.
     *
     * @returns An array of JavaScript objects containing the item name,
     * total sold, and total revenue.
     *
     * @example
     * let promise = Reports.monthlyReport();
     * promise.then(items => console.log(items));
     *
     * @memberof module:db/api.Reports
     */
    monthlyReport() {
        let monthlyReportSql = fs.readFileSync(path.resolve(__dirname, 'views/monthly_sales_report.sql'), 'utf8');

        return pool.query(monthlyReportSql)
                   .then(res => res.rows);
    }
}
/**
 * A collection of functions for interacting with the news / mailing list.
 *
 * @namespace
 */
exports.Offers = {
    /**
     * This function inserts news datainto tbl_news. The
     * returned data is an array that contains objects of the format:
     * @param {Object} news - Contains the news data.
     * @param {string} news.title - Contains the title of the article.
     * @param {String} news.dateAdded - Date of the article in default format.
     * @param {date} news.article - Article details.
     * @param {boolean} news.frontPage - boolean to dictate if news will be pushed to front page.
     *
     * @returns A Promise that contains a JS object representing the newly
     * created news item. If creation faileds, <code>null</code>
     * is returned.
     *
     * @memberof module:db/api.Offers
     */
    updateOffer({title, article, frontpage }) {
        var timeStamp = new Date();
        var year = timeStamp.getFullYear();
        var month = timeStamp.getMonth() + 1;  // month index value is 0-11 so we must compensate
        var day = timeStamp.getDate();
        let date = year + '-' + month + '-' + day;
        //console.log(frontpage) - for debugging
        if (frontpage == 'true') {}
        else{
            frontpage = false;
        }
            
        let updateOfferSQL = `INSERT INTO tbl_news(news_title, news_date_added, news_article, news_front_page
            ) VALUES($1, $2, $3, $4)
            RETURNING *`;

        return pool.query(updateOfferSQL, [title, date, article, frontpage])
            .then(res => res.rows[0])
            .catch(_ => null);
    },
    /**
     * Function reads the current offers form tbl_news
     * 
     * @memberof module:db/api.Offers
     */
    readOffers() {
        let readOffersSQL = `SELECT news_title, news_date_added, 
            news_article FROM tbl_news,
            ORDER BY news_date_added desc;`;

        return pool.query(readOffersSQL)
            .then(res => res.rows)
            .catch(_ => null);
    },
    /**
     * Function reads the current offers form tbl_news used on the front page
     * 
     * @memberof module:db/api.Offers
     */
    frontPageOffers() {
        let frontPageOffersSQL = 'SELECT news_title, news_date_added, news_article FROM tbl_news '+
            'WHERE news_front_page=\'true\' ORDER BY news_date_added desc;';

        return pool.query(frontPageOffersSQL)
            .then(res => res.rows);
    }


}

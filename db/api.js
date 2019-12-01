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
    search: function({id, name, itemType}) {
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
                ['item_name', name],
                ['item_type_id', itemType]
            ].filter(([_, value]) => !!value);

            // We must have at least one of id, name, or itemType.
            if (entries.length === 0) {
                throw new Error('Must specify at least one of: id, name, or itemType');
            }

            // The meat of the function:

            // We know that if we reached this code, entries has at least one
            // value inside it. We only need to test for the second one.
            // The first entry will be added to the where clause
            // but second entry must have an AND prepended.
            let [first, second] = entries;

            if (first[0] == 'item_name') {
                searchSql += `${first[0]} ILIKE $1 || '%'`;
            } else {
                searchSql += `${first[0]} = $1`;
            }

            if (second) {
                searchSql += ` AND ${second[0]} = $2`;
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
        return pool.query('SELECT * from tbl_members;')
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
            ].filter(([_, value]) => !!value);

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
            ].filter(([_, value]) => !!value);

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
 * A collection of functions for retrieving data to generate reports.
 *
 * @namespace
 */
exports.Reports = {
    /**
     * This functions retrieves report data for <em>each</em> item sale.
     * In other words, each sale to a customer has its own entry in the
     * returned data. The returned data is an array with objects of the format:
     * <br/>
     * <code>
     * {
     *     items_report_name: blah,
     *     items_report_quantity: blah,
     *     items_report_price: blah,
     *     store_id: blah,
     *     items_report_date: blah
     * }
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
        const getAllSql = 'SELECT * FROM items_report;';

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

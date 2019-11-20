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
     * <code>type</code>. It is an error to provide an empty object or an
     * object without at least one of the mentioned properties.
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
     * @param {String} item.type - The item type of the desired item.
     *
     * @returns An array of matching items, empty if no items were found.
     * TODO: More Details.
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
     * let items = Inventory.search({name: 'Call of Duty Classic', type: ps3Game});
     *
     * @memberof module:db/api.Inventory
     */
    search: function({id, name, type}) {
        // TODO: Write me.
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
     * @param {Boolean} memberData.phone - Whether the new member wishes to receive news letters.
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

        return pool.query(createSql, [123, password, firstName, lastName,
                                      postalCode, phone, mailingList,
                                      prefferedStore])
                   .then(res => res.rows[0])
                   .catch(_ => null);
    }
}

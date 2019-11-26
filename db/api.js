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

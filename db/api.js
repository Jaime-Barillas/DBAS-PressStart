/**
 * This module exports various objects which contain functions for interacting
 * with the Press Start database.
 * To require a particular set of functions, use the following code:
 * <br/>
 * <code>const { Inventory } = require('../db/api.js');</code>
 *
 * @module db/api
 */

/**
 * A collection of functions for interacting with the Press Start inventory.
 * Contains functions to retrieve inventory, search for specific inventory,
 * and update inventory.
 * To require this set of functions, use the following code:
 * <br/>
 * <code>const { Inventory } = require('../db/api.js');</code>
 *
 * @namespace
 */
exports.Inventory = {
    /**
     * This functions retrieves inventory items in a manner optimal for
     * pagination. The page offset, as well as, the amount of items per page
     * can be set.
     *
     * @summary Retrieves an array of inventory items from the Press Start
     * database.
     *
     * @param {Number} [page=1] - The page offset.
     * @param {Number} [pageLimit=1] - The number of items per page.
     *
     * @returns An array of objects containing item details. TODO: More Details.
     *
     * @example
     * let items = Inventory.getPaginated();      // Return the first page at 10 items per page.
     * @example
     * let items = Inventory.getPaginated(4);     // Return the fourth page at 10 items per page.
     * @example
     * let items = Inventory.getPaginated(4, 15); // Return the fourth page at 15 items per page.
     *
     * @memberof module:db/api.Inventory
     */
    getPaginated: function(page = 1, pageLimit = 10) {
        // TODO: Write me.
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

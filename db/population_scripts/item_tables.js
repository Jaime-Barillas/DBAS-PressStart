/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      19 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

const itemNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'itemnames.json'), 'utf8'));

//* ****FUNCTIONS**** */
// Generate random price within defined maxmimum
function randPrice(max) {
    return (Math.random() * max).toFixed(2);
}

// Generate random number with a defined maximum.
function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Generate a random string from defined array
function randNth(array) {
    return array[randInt(array.length)];
}

// Function to generate Seed Data
function genItem() {
    let item = [];

    item.push(randInt(20));
    item.push(randInt(10));
    item.push(randInt(1000));
    item.push(randNth(itemNames));
    item.push(randPrice(100));
    item.push(randPrice(100));
    item.push(randPrice(100));
    item.push(randInt(1000));
    item.push('The best game in the world.');

    return item;
}

// EXPORTED FUNCTION
exports.seedItemTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertItemSql = 'INSERT INTO tbl_items(item_type_id, store_id, '+
        'condition_id, item_name, item_cost, item_sale_price, '+
        'item_mrsp, item_stock_quantity, item_description) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';

    // Generate data -> queue up the queries -> close the connection.
    let items = Array.from({length: 50}, genItem);
    for (const item of items) {
        queries = queries.then(() => client.query(insertItemSql, item));
    }

    console.log('Closing Connection for table seed');
    queries.then(() => client.end());
}

/*
Author:     Shaun McCrum, Jaime Barillas
Created:    11 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_items
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');


exports.dropTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'      // The database may not yet exist so we log into the postgres database in the meantime.
    });
    client.connect();
    return client.query('DROP TABLE IF EXISTS tbl_items;')
                 .then(() => client.end());
}

exports.setupTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });

    // establish conneciton
    client.connect();
    // generate table
    return client.query(`CREATE TABLE tbl_items(
        item_id serial PRIMARY KEY,
        item_type_id integer REFERENCES tbl_item_types(item_type_id) NOT NULL,
        store_id integer REFERENCES tbl_stores(store_id) NOT NULL,
        condition_id integer REFERENCES tbl_conditions(condition_id) NOT NULL,
        item_name varchar(64),
        item_cost money,
        item_sale_price money,
        item_mrsp money,
        item_stock_quantity smallint,
        item_description varchar(128)
        );`)
        .then(() => console.log("items Table Created"))
        .then(() => client.end());
}
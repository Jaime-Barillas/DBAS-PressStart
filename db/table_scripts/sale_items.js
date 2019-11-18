/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_sale_items
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

dropTables();

function dropTables() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'      // The database may not yet exist so we log into the postgres database in the meantime.
    });
    client.connect();
    return client.query('DROP TABLE IF EXISTS tbl_sale_items;')
                 .then(() =>setupTables())
                 .then(() => client.end());
}

function setupTables() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });

    // establish conneciton
    client.connect();
    // generate table
    return client.query(`CREATE TABLE tbl_sale_items(
        sale_item_id serial PRIMARY KEY,
        item_id integer,
        invoice_id integer,
        sale_item_quantity smallint,
        sale_item_price money
        );`)
        .then(() => client.end());
}
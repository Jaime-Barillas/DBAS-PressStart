/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_repair_items
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

exports.dropTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'      
    });
    client.connect();
    return client.query('DROP TABLE IF EXISTS tbl_repair_items;')
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
    return client.query(`CREATE TABLE tbl_repair_items(
        repair_item_id serial PRIMARY KEY,
        repair_invoice_id integer REFERENCES tbl_repair_invoices(repair_invoice_id) NOT NULL,
        repair_part_name varchar(30),
        repair_item_part_description varchar(120),
        repair_item_cost money
        );`)
        .then(() => console.log("repair_items Table Created"))
        .then(() => client.end());
}
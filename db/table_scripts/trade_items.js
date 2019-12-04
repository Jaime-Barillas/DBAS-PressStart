/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_trade_items
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
    return client.query('DROP TABLE IF EXISTS tbl_trade_items;')
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
    return client.query(`CREATE TABLE tbl_trade_items(
        trade_item_id serial PRIMARY KEY,
        trade_invoice_id integer REFERENCES tbl_trade_invoices(trade_invoice_id) NOT NULL,
        item_id integer REFERENCES tbl_items(item_id) NOT NULL,
        trade_item_donation boolean,
        trade_item_value_offered money,
        trade_item_payout_type varchar(10),
        trade_item_final_trade_value money
        );`)
        .then(() => console.log("trade_items Table Created"))
        .then(() => client.end());
}
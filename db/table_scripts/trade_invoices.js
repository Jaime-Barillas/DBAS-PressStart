/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_trade_invoices
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
    return client.query('DROP TABLE IF EXISTS tbl_trade_invoices;')
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
    return client.query(`CREATE TABLE tbl_trade_invoices(
        trade_invoice_id serial PRIMARY KEY,
        customer_id integer,
        trade_invoice_date timestamp,
        trade_invoice_signed boolean
        );`)
        .then(() => client.end());
}
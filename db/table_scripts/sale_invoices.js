/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_sale_invoices
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
    return client.query('DROP TABLE IF EXISTS tbl_sale_invoices;')
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
    return client.query(`CREATE TABLE tbl_sale_invoices(
        invoide_id serial PRIMARY KEY,
        customer_id integer,
        employee_id integer,
        store_id integer,
        sale_invoice_date timestamp,
        );`)
        .then(() => client.end());
}
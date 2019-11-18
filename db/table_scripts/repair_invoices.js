/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_repair_invoices
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
    return client.query('DROP TABLE IF EXISTS tbl_repair_invoices;')
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
    return client.query(`CREATE TABLE tbl_repair_invoices(
        repair_invoice_id serial PRIMARY KEY,
        customer_id integer,
        employee_id integer,
        repair_status_id integer,
        repair_invoice_description varchar(120),
        repair_invoice_labour_hours_cost money
        );`)
        .then(() => client.end());
}
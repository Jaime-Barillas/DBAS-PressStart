/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      28 Nov 2019
Description:    Create database tables for tbl_repair_invoices
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
    return client.query('DROP TABLE IF EXISTS tbl_repair_invoices;')
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
    return client.query(`CREATE TABLE tbl_repair_invoices(
        repair_invoice_id serial PRIMARY KEY,
        member_id integer REFERENCES tbl_members(member_id) NOT NULL,
        employee_id integer REFERENCES tbl_employees(employee_id) NOT NULL,
        repair_status_id integer REFERENCES tbl_repair_status(repair_status_id) NOT NULL,
        repair_invoice_description varchar(120),
        repair_invoice_labour_hours smallint,
        repair_invoice_labour_hours_cost money
        );`)
        .then(() => console.log("repair_invoices Table Created"))
        .then(() => client.end());
}
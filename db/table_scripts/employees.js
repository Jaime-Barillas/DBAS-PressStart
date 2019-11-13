/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_employees
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
    return client.query('DROP TABLE IF EXISTS tbl_employees;')
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
    return client.query(`CREATE TABLE tbl_employees(
        employee_id serial,
        employee_password varchar(32),
        employee_first_name varchar(20),
        employee_last_name varchar(30),
        employee_job_title varchar(40),
        employee_phone varchar(10),
        employee_email varchar(60),
        employee_address varchar(120),
        employee_postal varchar(6),
        employee_availability text
        );`)
        .then(() => client.end());
}
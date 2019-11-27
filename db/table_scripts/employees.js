/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_employees
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
    return client.query('DROP TABLE IF EXISTS tbl_employees;')
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
    return client.query(`CREATE TABLE tbl_employees(
        employee_id serial PRIMARY KEY,
        employee_password varchar(32),
        employee_first_name varchar(20),
        employee_last_name varchar(30),
        employee_job_title varchar(40),
        employee_phone varchar(10),
        employee_email varchar(60),
        employee_address varchar(120),
        employee_postal_code varchar(6),
        employee_availability text,
        employee_wage money,
        employee_manager boolean
        );`)
        .then(() => client.end())
        ;
}
/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_repair_status
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
    return client.query('DROP TABLE IF EXISTS tbl_repair_status;')
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
    return client.query(`CREATE TABLE tbl_repair_status(
        repair_status_id serial PRIMARY KEY,
        repair_status_name varchar(20),
        repair_status_description varchar(50)
        );`)
        .then(() => client.end());
        //client.end();
}
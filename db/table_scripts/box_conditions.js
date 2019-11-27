/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_box_conditions
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

exports.dropTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'      // The database may not yet exist so we log into the postgres database in the meantime.
    });
    client.connect();
    return client.query('DROP TABLE IF EXISTS tbl_box_conditions;')
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
    return client.query(`CREATE TABLE tbl_box_conditions(
        box_condition_id serial PRIMARY KEY,
        box_condition_name varchar(20),
        box_condition_description varchar(50),
        box_condition_value decimal (8,2)
        );`)
        .then(() => client.end());
}
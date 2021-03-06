/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_manual_conditions
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
    return client.query('DROP TABLE IF EXISTS tbl_manual_conditions;')
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
    return client.query(`CREATE TABLE tbl_manual_conditions(
        manual_condition_id serial PRIMARY KEY,
        manual_condition_name varchar(20),
        manual_condition_description varchar(64),
        manual_condition_value decimal (8,2)
        );`)
        .then(() => console.log("manual_conditions Table Created"))
        .then(() => client.end());
}
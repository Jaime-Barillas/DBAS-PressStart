/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_conditions
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
    return client.query('DROP TABLE IF EXISTS tbl_conditions;')
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
    return client.query(`CREATE TABLE tbl_conditions(
        condition_id serial PRIMARY KEY,
        physical_condition_id integer REFERENCES tbl_physical_conditions(physical_condition_id) NOT NULL,
        box_condition_id integer REFERENCES tbl_box_conditions(box_condition_id) NOT NULL,
        manual_condition_id integer REFERENCES tbl_manual_conditions(manual_condition_id) NOT NULL
        );`)
        .then(() => console.log("conditions Table Created"))
        .then(() => client.end());
}
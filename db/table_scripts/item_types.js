/*
Author:     Shaun McCrum, Jaime Barillas
Created:    11 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_item_types
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
    return client.query('DROP TABLE IF EXISTS tbl_item_types;')
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
    return client.query(`CREATE TABLE tbl_item_types(
        item_type_id serial,
        item_type_name varchar(20),
        item_type_description varchar(50),
        item_type_value decimal(8,2)
        );`)
        .then(() => client.end());
}
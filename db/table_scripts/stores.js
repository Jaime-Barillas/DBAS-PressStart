/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_stores
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
    return client.query('DROP TABLE IF EXISTS tbl_stores;')
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
    return client.query(`CREATE TABLE tbl_stores(
        store_id serial PRIMARY KEY,
        store_address varchar(120),
        store_postal_code varchar(6),
        store_province varchar(2),
        store_phone_number varchar(10)
        );`)
        .then(() => client.end());
}
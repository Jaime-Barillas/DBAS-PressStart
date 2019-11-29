/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_reservations
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
    return client.query('DROP TABLE IF EXISTS tbl_reservations;')
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
    return client.query(`CREATE TABLE tbl_reservations(
        reservation_id serial PRIMARY KEY,
        store_id integer,
        member_id integer,
        reservation_date_reserved timestamp,
        reservation_received boolean
        );`)
        .then(() => console.log("reservations Table Created"))
        .then(() => client.end());
}
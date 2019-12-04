/*
Author:     Shaun McCrum
Created:    13 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_reservation_items
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
    return client.query('DROP TABLE IF EXISTS tbl_reservation_items;')
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
    return client.query(`CREATE TABLE tbl_reservation_items(
        reservation_item_id serial PRIMARY KEY,
        reservation_id integer REFERENCES tbl_reservations(reservation_id) NOT NULL,
        item_id integer REFERENCES tbl_items(item_id) NOT NULL
        );`)
        .then(() => console.log("reservation_items Table Created"))
        .then(() => client.end());
}
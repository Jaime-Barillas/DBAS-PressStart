/*
Author:     Shaun McCrum, Jaime Barillas
Created:    11 Nov 2019
Since:      13 Nov 2019
Description:    Create database tables for tbl_members
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
    return client.query('DROP TABLE IF EXISTS tbl_members;')
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
    return client.query(`CREATE TABLE tbl_members(
        member_id serial PRIMARY KEY,
        member_password varchar(32),
        member_preffered_store integer,
        member_first_name varchar(20),
        member_last_name varchar(30),
        member_postal_code varchar(6),
        member_phone varchar(10),
        member_email varchar(60),
        member_mailing_list boolean
        );`)
        .then(() => console.log("members Table Created"))
        .then(() => client.end());
}
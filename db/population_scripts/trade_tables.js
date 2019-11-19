/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      19 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

const firstNames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/', 'firstnames-short.json'), 'utf8'));
const lastNames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/', 'lastnames-short.json'), 'utf8'));
const streetnames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/', 'streetnames.json'), 'utf8'));
const streetnames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'streetnames.json'), 'utf8'));


function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randNth(array) {
    return array[randInt(array.length)];
}

function randPostalCode() {
    // TODO: Make pretty.
    // Canadian postal code rules:
    //     Does not include D, F, I, O, Q, U.
    //     W, Z, do not appear in the first letter.
    let firstAlpha = 'ABCEGHJKLMNPRSTVXY';
    let restAlpha = 'ABCEGHJKLMNPRSTVWXYZ';

    return randNth(firstAlpha) +
           randInt(10).toString() +
           randNth(restAlpha) +
           randInt(10).toString() +
           randNth(restAlpha) +
           randInt(10).toString();
}

function randPhoneNumber() {
    //     --3--3---4           --3--3---4
    return (1000000000 + randInt(8999999999)).toString();
}

function genStore() {
    let store = [];
    store.push(randInt(9999) +' '+ randNth(streetnames) + ' '
    +  randNth(['St','Blvd','Cres','Rd','Ct']) + '. ' + 
    randNth(['Oshawa', 'Toronto','Scarborough']));
    store.push(randPostalCode());
    store.push('ON');
    store.push(randPhoneNumber());
    return store;
}

exports.seedStores = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertStoreSql = 'INSERT INTO tbl_stores(store_address, store_postal_code, '+
        'store_province, store_phone_number) '+
        'VALUES($1, $2, $3, $4);';

    // Generate data -> queue up the queries -> close the connection.
    let stores = Array.from({length: 3}, genStore);
    for (const store of stores) {
        queries = queries.then(() => client.query(insertStoreSql, store));
    }

    console.log('Closing Connection for table seed');
    queries.then(() => client.end());
}

exports.seedBasicTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertMemberSql = 'INSERT INTO tbl_members(member_password, member_preffered_store, '+
        'member_first_name, member_last_name, member_postal_code, '+
        'member_phone, member_email, member_mailing_list) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8);';

    // Generate data -> queue up the queries -> close the connection.
    let members = Array.from({length: 50}, genMember);
    for (const member of members) {
        queries = queries.then(() => client.query(insertMemberSql, member));
    }

    console.log('Closing Connection for table seed');
    queries.then(() => client.end());
}
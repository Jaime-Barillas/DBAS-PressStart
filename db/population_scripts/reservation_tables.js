/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      27 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

// generate a random date to be used in the database
function randomDate() {
    let minDate = new Date(2013,1,1);
    let maxDate = new Date(2018,12,31);  
    // set a minimum date add a random number to it
    // multiply that date by the difference between the min and max date values.  
    // based on documentation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    var timeStamp = new Date(minDate.getTime() + Math.random() 
        * (maxDate.getTime() - minDate.getTime()));
    var year = timeStamp.getFullYear();
    var month = timeStamp.getMonth() + 1;  // month index value is 0-11 so we must compenste
    var day = timeStamp.getDate();
    return year + '-' + month + '-' + day ;
}

function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randNth(array) {
    return array[randInt(array.length)];
}

// generate a reservation "invoice"
function genReservation() {
    let reservation = [];
    reservation.push(randInt(2)+1);                 // store to use
    reservation.push(randInt(50)+1);                // member reserving
    reservation.push(randomDate());                 // date reserved
    reservation.push(randNth(['true','false']));    // Received?
    return reservation;
}

// generate a single reserved item
function genReservationItem() {
    let reserveItem = [];
    reserveItem.push(randInt(10)+1);    // hook an reserveItem to a reservation
    reserveItem.push(randInt(50)+1);    // item to reserve
    return reserveItem;
} 

exports.seedReservationTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data tbl_reservations
    let insertReservationSql = 'INSERT INTO tbl_reservations(store_id, '+
        'member_id, reservation_date_reserved, reservation_received) '+
        'VALUES($1, $2, $3, $4);';

    let insertReservationItemSql = 'INSERT INTO tbl_reservation_items(reservation_id, '+
        'item_id) '+
        'VALUES($1, $2);';

    // Generate data -> queue up the queries -> close the connection.
    let reservations = Array.from({length: 10}, genReservation);
    for (const reserve of reservations) {
        queries = queries.then(() => client.query(insertReservationSql, reserve));
    }

    let reserveItems = Array.from({length: 10}, genReservationItem);
    for (const reserveItem of reserveItems) {
        queries = queries.then(() => client.query(insertReservationItemSql, reserveItem));
    }

    console.log('Closing Connection for reservation table seed');
    return queries.then(() => client.end());
}
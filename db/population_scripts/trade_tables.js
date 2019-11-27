/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      27 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randNth(array) {
    return array[randInt(array.length)];
}

// Generate random price within defined maxmimum
function randPrice(max) {
    return (Math.random() * max).toFixed(2);
}

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
    var month = timeStamp.getMonth() + 1;  // month index value is 0-11 so we must compenstte
    var day = timeStamp.getDate();
    return year + '-' + month + '-' + day ;
}

function genTradeInvoice() {
    let tradeInvoice = [];
    tradeInvoice.push(randInt(10));     // member of trade
    tradeInvoice.push(randomDate());    // date of teade
    tradeInvoice.push(randNth(['true','false'])) // signed donation
    return tradeInvoice;
}

function genTradeItem() {
    let tradeItem = [];
    const cashPrice = 0.8;
    tradeItem.push(randInt(10));                // invoice to hook to
    tradeItem.push(randInt(50));                // item being donated
    tradeItem.push(randNth(['true','false']));  // is donation?
    // let tradeItemBaseSQL = 'SELECT item_sale_price FROM tbl_items WHERE item_id = $1 '+
    // 'VALUES($1);';
    // tradeItem = tradeItem.then(() => client.query(tradeItemBaseSQL, tradeItem));
    // let tradeConditionSQL = 'SELECT physical_condition_id, box_condition_id, manual_condition_id FROM tbl_conditions WHERE ';
    // tradeConditionSQL
    let initialPrice = randPrice(100);
    tradeItem.push(initialPrice);                           // value offered
    tradeItem.push(randNth(['credit', 'cash']));            // payout type
    tradeItem.push(initialPrice*cashPrice);                 // final payout
    return tradeItem;
}

exports.seedTradeTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertTradeInvoiceSql = 'INSERT INTO tbl_trade_invoices(member_id, employee_id ' +
    'trade_invoice_date, trade_invoice_signed)'+
        'VALUES($1, $2, $3, $4);';

    let insertTradeInvoiceSql = 'INSERT INTO tbl_trade_invoices(trade_invoice_id, item_id ' +
    'trade_item_donation, , trade_item_value_offered, trade_item_payout_type,  ' +
    'trade_item_final_trade_value)'+
        'VALUES($1, $2, $3, $4, $5, $6);';

    // Generate data -> queue up the queries -> close the connection.
    let tradeInvoices = Array.from({length: 50}, genTradeInvoice);
    for (const tradeInvoice of tradeInvoices) {
        queries = queries.then(() => client.query(insertTradeInvoiceSql, tradeInvoice));
    }

    let tradeItems = Array.from({length: 50}, genTradeItem);
    for (const tradeItem of tradeItems) {
        queries = queries.then(() => client.query(insertTradeItemSql, tradeItem));
    }

    console.log('Closing Connection for table seed');
    queries.then(() => client.end());
}
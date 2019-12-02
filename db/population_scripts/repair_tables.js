/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      27 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');
const repairClientDescription = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'repairDescriptions.json'), 'utf8'));
const repairDescription = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'repairInvoiceDescriptions.json'), 'utf8'));


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

function genRepairStatus() {
    let repairStatus = [];
    repairStatus.push(randNth(['open','closed']))       // status name
    repairStatus.push(randNth(repairClientDescription));      // status description
    return repairStatus;
}

function genRepairInvoice() {
    let repairInvoice = [];
    repairInvoice.push(randInt(50));     // customer_id
    repairInvoice.push(randInt(10));     // employee_id
    repairInvoice.push(randNth(10));     // repair_status_id
    repairInvoice.push(randNth(repairDescription));     // repair_invoice_description
    repairInvoice.push(randNth(8));      // repair_invoice_labour_hours
    repairInvoice.push(45);              // repair_invoice_cost hard coded labour cost
    return repairInvoice;
}

function genRepairItem() {
    let repairItem = [];
    repairItem.push(randInt(10));                    // repair_invoice_id
    repairItem.push(randNth(['Optical Drive', 'Power Cable', 'LR44 Battery', 'Controller Pad', '1TB Hard drive']));    // repair_part_name
    repairItem.push(randNth(repairDescription));    // repair_part_description
    repairItem.push(randPrice(99));                    // repair_item_cost
    return repairItem;
}

exports.seedRepairTables = function() {

    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting for seed as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertRepairStatusSql = 'INSERT INTO tbl_repair_status(repair_status_name, repair_status_description)'+
        'VALUES($1, $2);';

    let insertRepairInvoiceSqL = 'INSERT INTO tbl_repair_invoices(customer_id, employee_id, ' +
        'repair_status_id, repair_invoice_description, repair_invoice_labour_hours,  ' +
        'repair_invoice_labour_hours_cost)'+
        'VALUES($1, $2, $3, $4, $5, $6);';

    let insertRepairItemSql = 'INSERT INTO tbl_repair_items(repair_invoice_id, repair_part_name, ' +
        'repair_item_part_description, repair_item_cost)'+
        'VALUES($1, $2, $3, $4);';    

    // Generate data -> queue up the queries -> close the connection.
    let repairStatus = Array.from({length: 4}, genRepairStatus);
    for (const repairState of repairStatus) {
        queries = queries.then(() => client.query(insertRepairStatusSql, repairState));
    }

    let repairInvoices = Array.from({length:30}, genRepairInvoice);
    for (const repairInvoice of repairInvoices) {
        queries = queries.then(() => client.query(insertRepairInvoiceSqL, repairInvoice));
    }

    let repairItems = Array.from({length: 50}, genRepairItem);
    for (const repairItem of repairItems) {
        queries = queries.then(() => client.query(insertRepairItemSql, repairItem));
    }

    console.log('Closing Connection for repair table seed');
    return queries.then(() => client.end());
}
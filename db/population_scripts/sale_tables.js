/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      27 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

const invoices = 30;
const sales = 3;

function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
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

function randNth(array) {
    return array[randInt(array.length)];
}

function genSaleInvoice() {
    let saleInvoice = [];
    saleInvoice.push(randInt(50));  //member_id
    saleInvoice.push(randInt(10));  //employee_id
    saleInvoice.push(randInt(2));   //store_id
    saleInvoice.push(randomDate()); //invoice date
    return saleInvoice;
}

function genSaleItem() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    let saleItem = [];
    let item = randInt(50);
    
    
    // let itemQuery = client.connect();

    // const sql = 'SELECT item_sale_price FROM tbl_items WHERE item_id = $1';
    // const values = [5];
    // itemQuery = client.query(sql, values).then(res => {

    //     const data = res.rows;

    //     data.forEach(row => console.log(row));

    // }).finally(() => {
    //     client.end()
    // });


    // let getItemPriceSql = 'SELECT item_sale_price FROM tbl_items WHERE item_id  $1' ;
    // itemPrice = itemQuery.then(() => client.query(getItemPriceSql, item).then(res => {
    //     const data = res.rows;

    //     data.forEach(row => console.log(row));
    // }));
    //console.log("Price is " +  JSON.stringify(itemPrice));
    //client.end();
    saleItem.push(20);  //item_id
    saleItem.push(randInt(10));  //invoice_id
    saleItem.push(randInt(4));   //item_quantity
    //saleItem.push(item * itemPrice[1]);  //sale_price
    saleItem.push(item * 49.99);  //sale_price
    return saleItem;
}

// EXPORTED FUNCTION
exports.seedSalesTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertSaleInvoiceSql = 'INSERT INTO tbl_sale_invoices(member_id, employee_id, '+
        'store_id, sale_invoice_date) '+
        'VALUES($1, $2, $3, $4);';

    let insertSaleItemSql = 'INSERT INTO tbl_sale_items(item_id, invoice_id, ' +
        'sale_item_quantity, sale_item_price) '+
        'VALUES($1, $2, $3, $4);';

    // Generate data -> queue up the queries -> close the connection.
    let saleInvoices = Array.from({length: 10}, genSaleInvoice);
    for (const invoice of saleInvoices) {
        queries = queries.then(() => client.query(insertSaleInvoiceSql, invoice));
    }

    // Generate data -> queue up the queries -> close the connection.
    let saleItems = Array.from({length: 30}, genSaleItem);
    for (const saleItem of saleItems) {
        queries = queries.then(() => client.query(insertSaleItemSql, saleItem));
    }

    console.log('Closing Connection for sales table seed');
    return queries.then(() => client.end());
}
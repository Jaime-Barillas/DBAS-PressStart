const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

let client = new Client({
    user: 'pressstartadmin',
    database: 'pressstartdb'
});
let saleItem = [];
let item = [10];
let itemQuery = client.connect();
let getItemPriceSql = 'SELECT item_sale_price FROM tbl_items WHERE item_id = $1' ;
itemQuery = itemQuery.then(() => client.query(getItemPriceSql, setItem));
console.log("Price is " +  JSON.stringify(itemQuery));

function setItem() {
    return [20];
}


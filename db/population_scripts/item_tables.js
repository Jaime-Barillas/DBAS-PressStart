/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      28 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

const itemNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'itemnames.json'), 'utf8'));

//* ****FUNCTIONS**** */
// Generate random price within defined maxmimum
function randPrice(max) {
    return (Math.random() * max).toFixed(2);
}

// Generate random number with a defined maximum.
function randInt(max) {
    return (Math.floor(Math.random() * Math.floor(max)));
}

// Generate a random string from defined array
function randNth(array) {
    return array[randInt(array.length)];
}

// Function to generate Seed Data
function genItem() {
    let item = [];

    item.push(randInt(2)+1);                        // item type id
    item.push(randInt(2)+1);                        // store id
    item.push(randInt(25)+1);                       // condition id
    item.push(randNth(itemNames));                  // item name
    item.push(randPrice(100)+1);                    // store cost
    item.push(randPrice(100)+1);                    // sale price
    item.push(randPrice(100)+1);                    // mrsp
    item.push(randInt(1000)+1);                     // qty in stock
    item.push('The best game in the world.');       //item description

    return item;
}

// function generates an item type
function genItemType() {
    let itemType = [];
    let randomizer = randInt(1);
    if (randomizer == 0) {
        itemType.push('new');
        itemType.push('Brand New Item');
        itemType.push(1.00); // 100% value
    }
    else {
        itemType.push('used');
        itemType.push('Used Item');
        itemType.push(0.80); // 80% of base value
    }
    return itemType;
}

// function generates a box condition
function genBoxCondition() {
    let boxCondition = [];
    let randomizer = (randInt(4));
    if (randomizer == 0) {
        boxCondition.push('unsealed');
        boxCondition.push('An unsealed box, never opened');
        boxCondition.push(1.00); // value reduction
    }
    else if (randomizer == 1) {
        boxCondition.push('fatnastic');
        boxCondition.push('Fantastic condition, no obvious visible marks');
        boxCondition.push(2.00); // value reduction
    }
    else if (randomizer == 2) {
        boxCondition.push('damaged');
        boxCondition.push('Some damage to the box');
        boxCondition.push(3.00);  // value reduction
    }
    else if (randomizer == 3) {
        boxCondition.push('none');
        boxCondition.push('The box is not inclulded');
        boxCondition.push(5.00); // value reduction
    }

    return boxCondition;
}

// function generates a manual condition
function genManualCondition() {
    let manualCondition = [];
    let randomizer = (randInt(4));
    if (randomizer == 0) {
        manualCondition.push('unsealed');
        manualCondition.push('An unsealed game with manual included, never opened');
        manualCondition.push(1.00); // value reduction
    }
    else if (randomizer == 1) {
        manualCondition.push('fantastic');
        manualCondition.push('Fantastic condition, no visible marks or ripped pages');
        manualCondition.push(2.00); // value reduction
    }
    else if (randomizer == 2) {
        manualCondition.push('damaged');
        manualCondition.push('Might contain pen marks or ripped pages');
        manualCondition.push(3.00);  // value reduction
    }
    else if (randomizer == 3) {
        manualCondition.push('none');
        manualCondition.push('The manual has been lost');
        manualCondition.push(5.00); // value reduction
    }

    return manualCondition;
}

// function generates a physical condition
function genPhysicalCondition() {
    let physicalCondition = [];
    let randomizer = (randInt(4));
    if (randomizer == 0) {
        physicalCondition.push('unsealed');
        physicalCondition.push('An unsealed game, never opened');
        physicalCondition.push(1.00); // value reduction
    }
    else if (randomizer == 1) {
        physicalCondition.push('fantastic');
        physicalCondition.push('Absolutely fantastic condition, minimal visible marks');
        physicalCondition.push(2.00); // value reduction
    }
    else if (randomizer == 2) {
        physicalCondition.push('damaged');
        physicalCondition.push('Some damage to the cartride or man disk scratches');
        physicalCondition.push(3.00);  // value reduction
    }
    else if (randomizer == 3) {
        physicalCondition.push('high risk');
        physicalCondition.push('The media is damaged and may only work sporatically');
        physicalCondition.push(5.00); // value reduction
    }

    return physicalCondition;
}

// function generates a random condition
function genCondition() {
    let condition = [];
        condition.push(randInt(4)+1); //box condition
        condition.push(randInt(4)+1); //manual condition
        condition.push(randInt(4)+1); //physical condition

    return condition;
}

// EXPORTED FUNCTION
exports.seedItemTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data

    let insertItemTypeSql = 'INSERT INTO tbl_item_types(item_type_name, '+
        'item_type_description, item_type_value) '+
        'VALUES($1, $2, $3);';

    let insertBoxConditionSql = 'INSERT INTO tbl_box_conditions(box_condition_name, '+
        'box_condition_description, box_condition_value) '+
        'VALUES($1, $2, $3);';

    let insertManualConditionSql = 'INSERT INTO tbl_manual_conditions(manual_condition_name, '+
        'manual_condition_description, manual_condition_value) '+
        'VALUES($1, $2, $3);';
        
    let insertPhysicalConditionSql = 'INSERT INTO tbl_physical_conditions(physical_condition_name, '+
        'physical_condition_description, physical_condition_value) '+
        'VALUES($1, $2, $3);';
        
    let insertConditionSql = 'INSERT INTO tbl_conditions(box_condition_id, '+
        'manual_condition_id, physical_condition_id) '+
        'VALUES($1, $2, $3);';

    let insertItemSql = 'INSERT INTO tbl_items(item_type_id, store_id, '+
        'condition_id, item_name, item_cost, item_sale_price, '+
        'item_mrsp, item_stock_quantity, item_description) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';

    // Generate data -> queue up the queries -> close the connection.
    let itemTypes = Array.from({length: 2}, genItemType);
    for (const itemType of itemTypes) {
        queries = queries.then(() => client.query(insertItemTypeSql, itemType));
    }

    // Generate data -> queue up the queries -> close the connection.
    let boxConditions = Array.from({length: 4}, genBoxCondition);
    for (const boxCondition of boxConditions) {
        queries = queries.then(() => client.query(insertBoxConditionSql, boxCondition));
    }

    // Generate data -> queue up the queries -> close the connection.
    let manualConditions = Array.from({length: 4}, genManualCondition);
    for (const manualCondition of manualConditions) {
        queries = queries.then(() => client.query(insertManualConditionSql, manualCondition));
    }

    // Generate data -> queue up the queries -> close the connection.
    let physicalConditions = Array.from({length: 4}, genPhysicalCondition);
    for (const physicalCondition of physicalConditions) {
        queries = queries.then(() => client.query(insertPhysicalConditionSql, physicalCondition));
    }

    // Generate data -> queue up the queries -> close the connection.
    let conditions = Array.from({length: 25}, genCondition);
    for (const condition of conditions) {
        queries = queries.then(() => client.query(insertConditionSql, condition));
    }

    // Generate data -> queue up the queries -> close the connection.
    let items = Array.from({length: 50}, genItem);
    for (const item of items) {
        queries = queries.then(() => client.query(insertItemSql, item));
    }

    console.log('Closing Connection for item table seed');
    return queries.then(() => client.end());
    
}

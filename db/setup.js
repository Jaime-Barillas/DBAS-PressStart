/*
Author:     Jaime Barillas, Shaun McCrum
Created:    11 Nov 2019
Since:      19 Nov 2019
Description:    Create database and seed database tables.
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');
// === Import the table scripts ===
// Basic Tables
const storeFunction = require("./table_scripts/stores");
const memberFunction = require("./table_scripts/members");
const employeeFunction = require("./table_scripts/employees");
const newsFunction = require("./table_scripts/news");
// Item-related tables
const itemTypeFunction = require("./table_scripts/item_types");
const boxConditionFunction = require("./table_scripts/box_conditions");
const manualConditionFunction = require("./table_scripts/manual_conditions");
const physicalConditionFunction = require("./table_scripts/physical_conditions");
const conditionFunction = require("./table_scripts/conditions");
const itemFunction = require("./table_scripts/items");
// Sales tables
const saleInvoiceFunction = require("./table_scripts/sale_invoices");
const saleItemFunction = require("./table_scripts/sale_items");
// Trade Tables
const tradeInvoiceFunction = require("./table_scripts/trade_invoices");
const tradeItemFunction = require("./table_scripts/trade_items");
// Repair Tables
const repairStatusFunction = require("./table_scripts/repair_status");
const repairInvoiceFunction = require("./table_scripts/repair_invoices");
const repaiItemsFunction = require("./table_scripts/repair_items");
// Reservation Tables
const reservationFunction = require("./table_scripts/reservations");
const reservationItemFunction = require("./table_scripts/reservation_items");

/*======= Variables =======*/
const firstNames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/population_scripts', 'firstnames-short.json'), 'utf8'));
const lastNames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/population_scripts', 'lastnames-short.json'), 'utf8'));
const streetnames = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/population_scripts', 'streetnames.json'), 'utf8'));

/*======= Functions =======*/
function setupDatabase() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'postgres'      // The database may not yet exist so we log into the postgres database in the meantime.
    });
    if (client.connect()) {
        console.log('connection successful');
        return client.query('DROP DATABASE IF EXISTS pressstartdb;')
            .then(() => client.query('CREATE DATABASE pressstartdb;'))
            .then(() => client.end());
    }
    else {
        console.log("Unable to establish connection.");
        return;
    }  
}

function setupTables() {
    console.log('Removing Tables as necessary and Setting up new Tables.')
    // Drop and Create Tables.
    return storeFunction.dropTables()
    .then (() => storeFunction.setupTables())
    .then (() => memberFunction.dropTables())
    .then (() => memberFunction.setupTables())
    .then (() => employeeFunction.dropTables())
    .then (() => employeeFunction.setupTables())
    .then (() => newsFunction.dropTables())
    .then (() => newsFunction.setupTables())
    .then (() => itemTypeFunction.dropTables())
    .then (() => itemTypeFunction.setupTables())
    .then (() => boxConditionFunction.dropTables())
    .then (() => boxConditionFunction.setupTables())
    .then (() => manualConditionFunction.dropTables())
    .then (() => manualConditionFunction.setupTables())
    .then (() => physicalConditionFunction.dropTables())
    .then (() => physicalConditionFunction.setupTables())
    .then (() => conditionFunction.dropTables())
    .then (() => conditionFunction.setupTables())
    .then (() => itemFunction.dropTables())
    .then (() => itemFunction.setupTables())
    .then (() => saleInvoiceFunction.dropTables())
    .then (() => saleInvoiceFunction.setupTables())
    .then (() => saleItemFunction.dropTables())
    .then (() => saleItemFunction.setupTables())
    .then (() => tradeInvoiceFunction.dropTables())
    .then (() => tradeInvoiceFunction.setupTables())
    .then (() => tradeItemFunction.dropTables())
    .then (() => tradeItemFunction.setupTables())
    .then (() => repairStatusFunction.dropTables())
    .then (() => repairStatusFunction.setupTables())
    .then (() => repairInvoiceFunction.dropTables())
    .then (() => repairInvoiceFunction.setupTables())
    .then (() => repaiItemsFunction.dropTables())
    .then (() => repaiItemsFunction.setupTables())
    .then (() => reservationFunction.dropTables())
    .then (() => reservationItemFunction.setupTables()) 
    ;
}

function randPrice(max) {
    return (Math.random() * max).toFixed(2);
}

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

function randomWage() {
    // random wage generation
    min = Math.ceil(14);
    max = Math.floor(30);
    //sconsole.log((Math.random() * (max - min) + min).toFixed(2));
    return (Math.random() * (max - min) + min).toFixed(2);
    

}
// Set availability
function randomAvailability() {
    // random wage generation
    let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    let availabilityString= "";
    days = shuffle(days);
    // Shuffle referenced from the Fisher–Yates Shuffle method https://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
        var copyArray = [], n = array.length, i;
        
        // While there remain elements to shuffle…
        while (n) {
        
            // Pick a remaining element…
            i = Math.floor(Math.random() * array.length);
        
            // If not already shuffled, move it to the new array.
            if (i in array) {
                copyArray.push(array[i]);
            delete array[i];
            n--;
            }
        }
        return copyArray;
    }
    // ===  Define availability ===
    
    // Trim the array to random availability length
    // We must have some days so max trimmed set to 4.
    let  maxDaysOff = randInt(4);
    for (i=1; i<=maxDaysOff; i++)
    {
        days.pop();
    }
    //sort array alphabetically
    days = days.sort();

    // Set day availability.
    
    for (i=0; i<=days.length; i++)
    {
        availabilityString += days[i] + ' ';
    }
    return availabilityString;

}
// Generate member seed
function genMember() {
    let member = [];

    // Hardcode password so we can log-in as members for testing.
    member.push('password');
    member.push(1);
    member.push(randNth(firstNames));
    member.push(randNth(lastNames));
    member.push(randPostalCode());
    member.push(randPhoneNumber());
    member.push(`${member[2]}.${member[3]}@example.com`);
    member.push(randNth(['true', 'false']));
    
    return member;
}

function genItem() {
    let item = [];

    item.push(1);
    item.push(1);
    item.push(1);
    item.push(`TEST_ITEM_${randInt(100000)}`);
    item.push(randPrice(100));
    item.push(randPrice(100));
    item.push(randPrice(100));
    item.push(randInt(1000));
    item.push('A simple test item.');

    return item;
}

function genEmployee() {
    let employee = [];
    // Hardcode password so we can log-in as employees for testing.
    employee.push('password');
    employee.push(randNth(firstNames));
    employee.push(randNth(lastNames));
    employee.push(randNth(['technician', 'manager']));
    employee.push(randPhoneNumber());
    employee.push(`${employee[1]}.${employee[2]}@example.com`);
    employee.push(randInt(9999) +' '+ randNth(streetnames) +' '+  randNth(['St','Blvd','Cres','Rd','Ct']));
    employee.push(randPostalCode());
    employee.push(randomAvailability());
    employee.push(randomWage());
    return employee;
}

function seedTables() {
    // TODO: Move sql to its own file.
    
    let insertMemberSql = 'INSERT INTO tbl_members(member_password, member_preffered_store, member_first_name, member_last_name, '+
        'member_postal_code, member_phone, member_email, member_mailing_list) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
    let insertItemSql = 'INSERT INTO tbl_items(item_type_id, store_id, condition_id, item_name, item_cost, item_sale_price, '+
        'item_mrsp, item_stock_quantity, item_description) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';
    let insertEmployeeSQL = 'INSERT INTO tbl_employees(employee_password, employee_first_name, employee_last_name, '+
        'employee_job_title, employee_phone, employee_email, employee_address, employee_postal_code, employee_availability, employee_wage) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';

   
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    let queries = client.connect();

    // Generate members -> queue up the queries -> close the connection.
    let members = Array.from({length: 50}, genMember);
    for (const member of members) {
        queries = queries.then(() => client.query(insertMemberSql, member));
    }

    let items = Array.from({length: 50}, genItem);
    for (const item of items) {
        queries = queries.then(() => client.query(insertItemSql, item));
    }
    let employees = Array.from({length: 10}, genEmployee);
    for (const employee of employees) {
        queries = queries.then(() => client.query(insertEmployeeSQL, employee));
    }
    console.log('Closing Connection for seed');
    queries.then(() => client.end());
}

switch(process.argv[2]) {
    case 'reset':
        console.log('Reseting database tables...');
        setupDatabase()
            .then(() => setupTables());
        console.log('Done!');
        break;

    case 'seed':
        console.log('Seeding databaes tables...');
        seedTables();
        console.log('Done!');
        break;

    default:
        console.log('Performing full setup of the Press Start database...');
        setupDatabase()
            .then(() => setupTables())
            .then(() => seedTables())
            ;
        console.log('Done!');
        break;
}


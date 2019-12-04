/*
Author:     Jaime Barillas, Shaun McCrum
Created:    11 Nov 2019
Since:      19 Nov 2019
Description:    Create database and seed database tables.
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

/*======= Variables =======*/
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

// Seeidng Scripts
const basicTables = require("./population_scripts/basic_tables");
const itemTables = require("./population_scripts/item_tables");
const saleTables = require("./population_scripts/sale_tables");
const tradeTables = require("./population_scripts/trade_tables");
const repairTables = require("./population_scripts/repair_tables");
const reservationTables = require("./population_scripts/reservation_tables");

// Views
const itemsReportView = require('./views/items_report');

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
    .then (() => reservationFunction.setupTables())
    .then (() => reservationItemFunction.dropTables())
    .then (() => reservationItemFunction.setupTables()) 
    .catch(console.log.bind(console))
    ;
}

// Generate Table Data
function seedTables() {
    console.log('Seeding Tables.')
    return basicTables.seedBasicTables()
    .then (() => itemTables.seedItemTables())
    .then (() => saleTables.seedSalesTables())
    .then (() => repairTables.seedRepairTables())
    .then (() => tradeTables.seedTradeTables())
    .then (() => reservationTables.seedReservationTables())
    .catch(console.log.bind(console))
    ;
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

    case 'views':
        console.log('Setting up views...');
        itemsReportView.setupView()
            .then(() => console.log('Done!'));
        break;

    default:
        console.log('Performing full setup of the Press Start database...');
        setupDatabase()
            .then(() => setupTables())
            .then(() => console.log('Table Setup... Done!'))
            //.then(() => seedTables())
            .then(() => console.log('Table Seeding... Done!'))
            ;
        break;
}


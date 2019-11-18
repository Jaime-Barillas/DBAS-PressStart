/*
Author:     Jaime Barillas, Shaun McCrum
Created:    11 Nov 2019
Since:      18 Nov 2019
Description:    Create database and seed database tables.
*/

const fs = require('fs');
const path = require('path');
//const employeeFunction = require("./table_scripts/employees.js");

const { Client } = require('pg');

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
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log('Setting up Tables.')
    // TODO: Maybe move sql to its own file and read it in?
    
    client.connect();
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
        .then(() => client.query(`CREATE TABLE tbl_items(
            item_id serial PRIMARY KEY,
            item_type_id integer,
            store_id integer,
            condition_id integer,
            item_name varchar(20),
            item_cost money,
            item_sale_price money,
            item_mrsp money,
            item_stock_quantity smallint,
            item_description varchar(120)
        );`))
        .then (() => client.query(`CREATE TABLE tbl_employees(
            employee_id serial PRIMARY KEY,
            employee_password varchar(32),
            employee_first_name varchar(20),
            employee_last_name varchar(30),
            employee_job_title varchar(40),
            employee_phone varchar(10),
            employee_email varchar(60),
            employee_address varchar(120),
            employee_postal_code varchar(6),
            employee_availability text,
            employee_wage money
            );`))
        .then(() => client.end());
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
function randomAvailability() {
    // random wage generation
    let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    return randNth(days) + ' ' + randNth(days) + '' + randNth(days);

}

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
    employee.push(randInt(9999) + randNth(streetnames) + randNth('St','Blvd','Cres','Rd','Ct'));
    employee.push(randPostalCode());
    employee.push(randomAvailability());
    employee.push(randomWage());
    return employee;

}

function seedTables() {
    // TODO: Move sql to its own file.
    
    let insertMemberSql = 'INSERT INTO tbl_members(member_password, member_preffered_store, member_first_name, member_last_name, member_postal_code, member_phone, member_email, member_mailing_list) VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
    let insertItemSql = 'INSERT INTO tbl_items(item_type_id, store_id, condition_id, item_name, item_cost, item_sale_price, item_mrsp, item_stock_quantity, item_description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';
    let insertEmployeeSQL = 'INSERT INTO tbl_employees(employee_password, employee_first_name, employee_last_name, '+
        'employee_job_title, employee_phone, employee_email, employee_address, employee_postal_code, employee_availability, employee_wage) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';

   
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


const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

/*======= Variables =======*/
const firstNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'firstnames-short.json'), 'utf8'));
const lastNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'lastnames-short.json'), 'utf8'));

/*======= Functions =======*/
function setupDatabase() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'postgres'      // The database may not yet exist so we log into the postgres database in the meantime.
    });
    client.connect();
    return client.query('DROP DATABASE IF EXISTS pressstartdb;')
                 .then(() => client.query('CREATE DATABASE pressstartdb;'))
                 .then(() => client.end());
}

function setupTables() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
        
    });

    // TODO: Maybe move sql to its own file and read it in?
    client.connect();
    return client.query(`CREATE TABLE tbl_members(
                    member_id serial PRIMARY KEY,
                    member_password varchar(512),
                    member_preffered_store integer,
                    member_first_name varchar(20),
                    member_last_name varchar(30),
                    member_postal_code varchar(6),
                    member_phone varchar(10),
                    member_email varchar(60),
                    member_mailing_list boolean
                );`)
                .then(() => client.query(`CREATE TABLE tbl_items(
                    item_id serial,
                    item_type_id integer,
                    item_store_id integer,
                    item_condition_id integer,
                    item_name varchar(20),
                    item_cost money,
                    item_sale_price money,
                    item_mrsp money,
                    item_stock_quantity smallint,
                    item_description varchar(120)
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

function seedTables() {
    // TODO: Move sql to its own file.
    let insertMemberSql = 'INSERT INTO tbl_members(member_password, member_preffered_store, member_first_name, member_last_name, member_postal_code, member_phone, member_email, member_mailing_list) VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
    let insertItemSql = 'INSERT INTO tbl_items(item_type_id, item_store_id, item_condition_id, item_name, item_cost, item_sale_price, item_mrsp, item_stock_quantity, item_description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';

    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
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

    queries.then(() => client.end());
}

switch(process.argv[2]) {
    case 'reset':
        console.log('Reseting database tables...');
        setupDatabase()
            .then(() => setupTables());
        console.log('Done!')
        break;

    case 'seed':
        console.log('Seeding databaes tables...');
        seedTables();
        console.log('Done!')
        break;

    default:
        console.log('Performing full setup of the Press Start database...');
        setupDatabase()
            .then(() => setupTables())
            .then(() => seedTables());
        console.log('Done!')
        break;
}


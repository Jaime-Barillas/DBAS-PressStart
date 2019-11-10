const { Client } = require('pg');

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
                     member_email varchar(40),
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

switch(process.argv[2]) {
    case 'reset':
        console.log('Reseting database tables...');
        setupDatabase()
            .then(() => setupTables());
        console.log('Done!')
        break;

    case 'seed':
        console.log('Seeding databaes tables...');
        console.log('Done!')
        break;

    default:
        console.log('Performing full setup of the Press Start database...');
        setupDatabase()
            .then(() => setupTables());
        console.log('Done!')
        break;
}


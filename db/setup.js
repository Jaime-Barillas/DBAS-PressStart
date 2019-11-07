const { Client } = require('pg');

var client = new Client({
    user: 'pressstartadmin',
    database: 'postgres'      // The database may not yet exist so we log into the postgres database in the meantime.
});

function setupDatabase() {
    client.connect();
    return client.query('DROP DATABASE IF EXISTS pressstartdb')
                 .then(() => client.query('CREATE DATABASE pressstartdb;'))
                 .then(() => client.end());
}

switch(process.argv[2]) {
    case 'reset':
        console.log('Reseting database tables...');
        setupDatabase();
        console.log('Done!')
        break;

    case 'seed':
        console.log('Seeding databaes tables...');
        console.log('Done!')
        break;

    default:
        console.log('Performing full setup of the Press Start database...');
        setupDatabase();
        console.log('Done!')
        break;
}


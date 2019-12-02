const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

exports.setupView = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });

    let sql = fs.readFileSync(path.resolve(__dirname, 'items_report.sql'), 'utf8');
    return client.connect()
                 .then(() => {
                     console.log('connection successful. Adding items_report view');
                     return client.query(sql);
                 })
                 .then(() => client.end())
                 .catch(err => console.log(err));
}
